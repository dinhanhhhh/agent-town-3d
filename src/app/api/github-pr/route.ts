import { NextRequest, NextResponse } from 'next/server';

const MAX_DIFF_CHARS = 14000;

/**
 * Phân tích URL GitHub Pull Request công khai:
 * Hỗ trợ: https://github.com/owner/repo/pull/123 hoặc owner/repo#123
 */
function parseGitHubPrInput(input: string): { owner: string; repo: string; pullNumber: number } | null {
  const trimmed = input.trim();

  const urlMatch = trimmed.match(
    /^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/pull\/(\d+)/i
  );
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2],
      pullNumber: parseInt(urlMatch[3], 10),
    };
  }

  const shortMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)#(\d+)$/);
  if (shortMatch) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2],
      pullNumber: parseInt(shortMatch[3], 10),
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prUrl = typeof body?.prUrl === 'string' ? body.prUrl : '';

    const parsed = parseGitHubPrInput(prUrl);
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            'Định dạng URL GitHub PR không hợp lệ. Vui lòng nhập dạng https://github.com/owner/repo/pull/123',
        },
        { status: 400 }
      );
    }

    const { owner, repo, pullNumber } = parsed;
    const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}`;

    const commonHeaders: Record<string, string> = {
      'User-Agent': 'Agent-Town-3D-DevOps-Auditor',
    };
    if (process.env.GITHUB_TOKEN) {
      commonHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN.trim()}`;
    }

    const [metaRes, diffRes] = await Promise.all([
      fetch(apiUrl, {
        headers: {
          ...commonHeaders,
          Accept: 'application/vnd.github.v3+json',
        },
        signal: req.signal,
      }),
      fetch(apiUrl, {
        headers: {
          ...commonHeaders,
          Accept: 'application/vnd.github.v3.diff',
        },
        signal: req.signal,
      }),
    ]);

    if (!metaRes.ok) {
      if (metaRes.status === 404) {
        return NextResponse.json(
          { error: `Không tìm thấy Pull Request ${owner}/${repo}#${pullNumber} (hoặc repo ở chế độ Private).` },
          { status: 404 }
        );
      }
      if (metaRes.status === 403) {
        return NextResponse.json(
          { error: 'GitHub API tạm giới hạn tần suất (Rate Limit). Vui lòng thử lại sau ít phút.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Lỗi truy xuất GitHub API (HTTP ${metaRes.status}).` },
        { status: metaRes.status }
      );
    }

    const meta = await metaRes.json();
    let diffText = '';

    if (diffRes.ok) {
      diffText = await diffRes.text();
    } else {
      // Fallback sang endpoint /files nếu .diff quá lớn trên GitHub
      const filesRes = await fetch(`${apiUrl}/files?per_page=15`, {
        headers: {
          ...commonHeaders,
          Accept: 'application/vnd.github.v3+json',
        },
        signal: req.signal,
      });
      if (filesRes.ok) {
        const files = await filesRes.json();
        diffText = (Array.isArray(files) ? files : [])
          .map(
            (f: { filename: string; patch?: string; additions?: number; deletions?: number }) =>
              `diff --git a/${f.filename} b/${f.filename}\n--- a/${f.filename}\n+++ b/${f.filename}\n${
                f.patch || `@@ -1,1 +1,1 @@\n+// Binary or large file (+${f.additions || 0} / -${f.deletions || 0})`
              }`
          )
          .join('\n\n');
      }
    }

    if (!diffText.trim()) {
      diffText = `diff --git a/README.md b/README.md\n--- a/README.md\n+++ b/README.md\n@@ -1,1 +1,2 @@\n+// Pull Request #${pullNumber}: ${meta.title || 'No textual diff changes'}`;
    }

    let isTruncated = false;
    if (diffText.length > MAX_DIFF_CHARS) {
      const cutIdx = diffText.lastIndexOf('\n', MAX_DIFF_CHARS);
      diffText =
        diffText.slice(0, cutIdx > 0 ? cutIdx : MAX_DIFF_CHARS) +
        `\n# ... [Diff được rút gọn ở mức ${MAX_DIFF_CHARS} ký tự để tối ưu tốc độ AI Audit]`;
      isTruncated = true;
    }

    return NextResponse.json({
      success: true,
      pr: {
        owner,
        repo,
        number: meta.number || pullNumber,
        title: meta.title || `Pull Request #${pullNumber}`,
        state: meta.state || 'open',
        author: meta.user?.login || 'unknown',
        baseRef: meta.base?.ref || 'main',
        headRef: meta.head?.ref || 'feature',
        additions: meta.additions ?? 0,
        deletions: meta.deletions ?? 0,
        changedFiles: meta.changed_files ?? 1,
        body: typeof meta.body === 'string' ? meta.body.slice(0, 1500) : '',
        htmlUrl: meta.html_url || `https://github.com/${owner}/${repo}/pull/${pullNumber}`,
        isTruncated,
      },
      diff: diffText,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi kết nối tới GitHub API.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
