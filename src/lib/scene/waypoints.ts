import * as THREE from 'three';
import { AgentRole } from '../pipeline/stages';
import { STATIONS_LAYOUT } from './layout';

export interface StationNavPoints {
  handover: THREE.Vector3;
  door: THREE.Vector3;
  street: THREE.Vector3;
  plaza: THREE.Vector3;
  angle: number;
}

/**
 * Trả về các điểm mốc điều hướng chuẩn xác theo hình học 3D cho từng trạm:
 * - handover: điểm bước vào trong phòng sát mép bàn làm việc để giao/nhận tận tay kỹ sư
 * - door: điểm bậc thềm cửa kính của phòng (cách tâm phòng 2.1m)
 * - street: điểm trên đại lộ nhánh dẫn vào trạm (cách tâm phòng 3.6m)
 * - plaza: điểm tiếp giáp với vòng xuyến đại lộ trung tâm (bán kính R = 4.4m quanh lâu đài)
 * - angle: góc cực từ tâm đảo đến đại lộ của trạm
 */
export function getStationNavPoints(role: AgentRole): StationNavPoints {
  if (role === 'orchestrator') {
    return {
      handover: new THREE.Vector3(0, 0.80, 1.15),
      door: new THREE.Vector3(0, 0.68, 2.5),
      street: new THREE.Vector3(0, 0.64, 3.8),
      plaza: new THREE.Vector3(0, 0.64, 4.4),
      angle: Math.PI / 2, // 90 độ (hướng Nam)
    };
  }

  const layout = STATIONS_LAYOUT[role];
  const rotY = layout.rotationY;
  const fwdX = Math.sin(rotY);
  const fwdZ = Math.cos(rotY);

  // Điểm đứng ngay trước bàn làm việc bên trong phòng Lab để bàn giao kiện hàng
  const handover = new THREE.Vector3(
    layout.position[0] + fwdX * 0.85,
    0.82,
    layout.position[2] + fwdZ * 0.85
  );

  // Bậc thềm đá trước cửa mở
  const door = new THREE.Vector3(
    layout.position[0] + fwdX * 2.1,
    0.66,
    layout.position[2] + fwdZ * 2.1
  );

  // Đầu đại lộ nhánh nối vào trạm
  const street = new THREE.Vector3(
    layout.position[0] + fwdX * 3.6,
    0.64,
    layout.position[2] + fwdZ * 3.6
  );

  // Điểm giao cắt trên vòng xuyến đại lộ trung tâm (R = 4.4m)
  const angle = Math.atan2(street.z, street.x);
  const plaza = new THREE.Vector3(
    Math.cos(angle) * 4.4,
    0.64,
    Math.sin(angle) * 4.4
  );

  return { handover, door, street, plaza, angle };
}

/**
 * Tạo danh sách waypoints di chuyển liên tục từ bàn làm việc trạm A tới tận bàn làm việc trạm B:
 * 1. Nhận kiện hàng từ mép bàn làm việc trạm A (Handover A) -> bước qua cửa (Door A)
 * 2. Đi ra đại lộ nhánh (Street A) vào vòng xuyến trung tâm (Plaza A)
 * 3. Chạy theo cung tròn êm ái trên vòng xuyến đại lộ đá (R = 4.4m)
 * 4. Rẽ vào đại lộ nhánh của trạm đích (Plaza B -> Street B -> Door B)
 * 5. Bước vào trong phòng và đặt kiện hàng lên bàn trạm B (Handover B)
 */
export function getRouteWaypoints(from: AgentRole, to: AgentRole): THREE.Vector3[] {
  const start = getStationNavPoints(from);
  const end = getStationNavPoints(to);

  const waypoints: THREE.Vector3[] = [start.handover, start.door, start.street, start.plaza];

  // Tính góc quay ngắn nhất trên vòng xuyến trung tâm
  let deltaAngle = end.angle - start.angle;
  while (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
  while (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

  // Chia nhỏ cung tròn thành các bước mượt mà (khoảng 30-45 độ mỗi bước)
  const steps = Math.max(2, Math.ceil(Math.abs(deltaAngle) / (Math.PI / 4)));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const curAngle = start.angle + deltaAngle * t;
    waypoints.push(
      new THREE.Vector3(
        Math.cos(curAngle) * 4.4,
        0.64,
        Math.sin(curAngle) * 4.4
      )
    );
  }

  waypoints.push(end.plaza, end.street, end.door, end.handover);
  return waypoints;
}

/**
 * Nội suy vị trí và góc xoay của shipper theo phương pháp Centripetal Spline:
 * - Không bao giờ bị vồng (overshoot) hay cắt ngang tường
 * - Shipper luôn bám sát tim đường đá và xoay người theo hướng di chuyển
 */
export function interpolateCourierPosition(
  waypoints: THREE.Vector3[],
  progress: number
): { position: THREE.Vector3; rotationY: number } {
  // Dùng centripetal spline để triệt tiêu hiện tượng vồng góc (no overshoot)
  const curve = new THREE.CatmullRomCurve3(waypoints, false, 'centripetal');
  const clamped = Math.max(0, Math.min(1, progress));
  const position = curve.getPointAt(clamped);

  // Tính vector tiếp tuyến để xác định hướng nhìn chuẩn xác
  const delta = 0.015;
  const t0 = Math.max(0, clamped - delta);
  const t1 = Math.min(1, clamped + delta);
  const p0 = curve.getPointAt(t0);
  const p1 = curve.getPointAt(t1);

  const dx = p1.x - p0.x;
  const dz = p1.z - p0.z;
  const rotationY = Math.hypot(dx, dz) > 0.0001 ? Math.atan2(dx, dz) : 0;

  return { position, rotationY };
}
