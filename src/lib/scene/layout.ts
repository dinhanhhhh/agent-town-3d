import { AgentRole } from '../pipeline/stages';
import { TOKENS } from '../../styles/tokens';

export interface StationLayout {
  role: AgentRole;
  name: string;
  tag: string;
  position: [number, number, number];
  rotationY: number;
  roofColor: number;
  wallColor: number;
  accentColor: number;
  buildingType: 'castle' | 'office' | 'workshop' | 'windmill' | 'lab' | 'fortress' | 'harbor' | 'watchtower';
  bubbleOffset: [number, number, number];
  focusCamera: [number, number, number];
}

/**
 * BỐ CỤC ĐỐI XỨNG HÌNH HỌC HOÀN HẢO (Radial Polar Layout - Bán kính R = 9.2m):
 * - Hub 0 (Claude Code Orchestrator) đặt tại tâm đảo [0, 0]
 * - 7 Trạm chuyên môn phân bổ đều đối xứng tuyệt đối qua trục Bắc - Nam
 * - Mọi phòng đều hướng mặt mở 100% thẳng về Lâu đài trung tâm
 * - Tuyệt đối không có phòng nào bị lệch góc hay chĩa vách tường vào đường đi
 */
export const STATIONS_LAYOUT: Record<AgentRole, StationLayout> = {
  orchestrator: {
    role: 'orchestrator',
    name: 'Claude Code',
    tag: 'HUB 0',
    position: [0, 0.6, 0],
    rotationY: 0,
    roofColor: 0x0284c7, // tech cyan accent
    wallColor: TOKENS.palette3D.creamWall,
    accentColor: 0x38bdf8,
    buildingType: 'office',
    bubbleOffset: [0, 4.5, 0],
    focusCamera: [0, 2.0, 0],
  },
  pm: {
    role: 'pm',
    name: 'PM · BA',
    tag: 'STATION 1',
    position: [-6.5, 0.6, -6.5],
    rotationY: Math.PI / 4, // 45 độ hướng Đông Nam về tâm
    roofColor: TOKENS.palette3D.roofBlue,
    wallColor: TOKENS.palette3D.creamWall,
    accentColor: 0x3b82f6,
    buildingType: 'office',
    bubbleOffset: [0, 4.8, 0],
    focusCamera: [-6.5, 1.6, -6.5],
  },
  dev: {
    role: 'dev',
    name: 'Dev Engineer',
    tag: 'STATION 2',
    position: [-9.2, 0.6, 0],
    rotationY: Math.PI / 2, // 90 độ hướng Đông về tâm
    roofColor: TOKENS.palette3D.roofRed,
    wallColor: TOKENS.palette3D.wood,
    accentColor: 0xef4444,
    buildingType: 'workshop',
    bubbleOffset: [0, 4.6, 0],
    focusCamera: [-9.2, 1.6, 0],
  },
  review: {
    role: 'review',
    name: 'Tech Review',
    tag: 'STATION 3',
    position: [-6.5, 0.6, 6.5],
    rotationY: (3 * Math.PI) / 4, // 135 độ hướng Đông Bắc về tâm
    roofColor: TOKENS.palette3D.roofYellow,
    wallColor: TOKENS.palette3D.creamWall,
    accentColor: 0xeab308,
    buildingType: 'windmill',
    bubbleOffset: [0, 5.2, 0],
    focusCamera: [-6.5, 1.6, 6.5],
  },
  qa: {
    role: 'qa',
    name: 'QA · Test',
    tag: 'STATION 4',
    position: [6.5, 0.6, -6.5],
    rotationY: -Math.PI / 4, // -45 độ hướng Tây Nam về tâm
    roofColor: TOKENS.palette3D.roofPurple,
    wallColor: TOKENS.palette3D.creamWall,
    accentColor: 0xa855f7,
    buildingType: 'lab',
    bubbleOffset: [0, 4.8, 0],
    focusCamera: [6.5, 1.6, -6.5],
  },
  security: {
    role: 'security',
    name: 'DevSecOps',
    tag: 'STATION 5',
    position: [9.2, 0.6, 0],
    rotationY: -Math.PI / 2, // -90 độ hướng Tây về tâm
    roofColor: TOKENS.palette3D.roofTeal,
    wallColor: TOKENS.palette3D.stone,
    accentColor: 0x14b8a6,
    buildingType: 'fortress',
    bubbleOffset: [0, 4.9, 0],
    focusCamera: [9.2, 1.6, 0],
  },
  devops: {
    role: 'devops',
    name: 'Release Eng',
    tag: 'STATION 6',
    position: [6.5, 0.6, 6.5],
    rotationY: -(3 * Math.PI) / 4, // -135 độ hướng Tây Bắc về tâm
    roofColor: TOKENS.palette3D.roofOrange,
    wallColor: TOKENS.palette3D.darkStone,
    accentColor: 0xf97316,
    buildingType: 'harbor',
    bubbleOffset: [0, 5.0, 0],
    focusCamera: [6.5, 1.6, 6.5],
  },
  monitor: {
    role: 'monitor',
    name: 'APM Telemetry',
    tag: 'STATION 7',
    position: [0, 0.6, -9.2],
    rotationY: 0, // 0 độ hướng Nam về tâm
    roofColor: TOKENS.palette3D.roofGreen,
    wallColor: TOKENS.palette3D.stone,
    accentColor: 0x22c55e,
    buildingType: 'watchtower',
    bubbleOffset: [0, 6.2, 0],
    focusCamera: [0, 2.6, -9.2],
  },
};
