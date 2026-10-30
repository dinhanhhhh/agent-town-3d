import * as THREE from 'three';
import { AgentRole } from '../pipeline/stages';
import { STATIONS_LAYOUT } from './layout';

export interface StationNavPoints {
  door: THREE.Vector3;
  street: THREE.Vector3;
  plaza: THREE.Vector3;
  angle: number;
}

/**
 * Trả về các điểm mốc điều hướng chuẩn xác theo hình học 3D cho từng trạm:
 * - door: điểm dừng trước bậc thềm đá mở của phòng (cách tâm phòng 2.5m, hoàn toàn bên ngoài phòng)
 * - street: điểm trên đại lộ nhánh dẫn vào trạm (cách tâm phòng 3.8m)
 * - plaza: điểm tiếp giáp với vòng xuyến đại lộ trung tâm (bán kính R = 4.4m quanh lâu đài)
 * - angle: góc cực từ tâm đảo đến đại lộ của trạm
 */
export function getStationNavPoints(role: AgentRole): StationNavPoints {
  if (role === 'orchestrator') {
    return {
      door: new THREE.Vector3(0, 0.64, 3.2),
      street: new THREE.Vector3(0, 0.64, 3.8),
      plaza: new THREE.Vector3(0, 0.64, 4.4),
      angle: Math.PI / 2, // 90 độ (hướng Nam)
    };
  }

  const layout = STATIONS_LAYOUT[role];
  const rotY = layout.rotationY;
  const fwdX = Math.sin(rotY);
  const fwdZ = Math.cos(rotY);

  // Bậc thềm đá trước cửa mở (không đè lên tường hay nội thất)
  const door = new THREE.Vector3(
    layout.position[0] + fwdX * 2.5,
    0.64,
    layout.position[2] + fwdZ * 2.5
  );

  // Đầu đại lộ nhánh nối vào trạm
  const street = new THREE.Vector3(
    layout.position[0] + fwdX * 3.8,
    0.64,
    layout.position[2] + fwdZ * 3.8
  );

  // Điểm giao cắt trên vòng xuyến đại lộ trung tâm (R = 4.4m)
  const angle = Math.atan2(street.z, street.x);
  const plaza = new THREE.Vector3(
    Math.cos(angle) * 4.4,
    0.64,
    Math.sin(angle) * 4.4
  );

  return { door, street, plaza, angle };
}

/**
 * Tạo danh sách waypoints di chuyển hoàn toàn trên mạng lưới đường đá:
 * 1. Xuất phát từ thềm cửa mở của trạm xuất phát (Door A)
 * 2. Đi ra đại lộ nhánh (Street A) vào vòng xuyến trung tâm (Plaza A)
 * 3. Chạy theo cung tròn êm ái trên vòng xuyến đại lộ đá (R = 4.4m) tránh tuyệt đối lâu đài và các phòng
 * 4. Rẽ vào đại lộ nhánh của trạm đích (Plaza B -> Street B)
 * 5. Dừng lại giao hàng ngay bậc thềm cửa mở của trạm đích (Door B)
 */
export function getRouteWaypoints(from: AgentRole, to: AgentRole): THREE.Vector3[] {
  const start = getStationNavPoints(from);
  const end = getStationNavPoints(to);

  const waypoints: THREE.Vector3[] = [start.door, start.street, start.plaza];

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

  waypoints.push(end.plaza, end.street, end.door);
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
