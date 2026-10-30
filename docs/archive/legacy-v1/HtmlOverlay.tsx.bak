'use client';

import React, { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const HtmlOverlayContext = createContext<React.RefObject<HTMLDivElement | null>>({ current: null });

interface HtmlOverlayProps {
  position?: [number, number, number];
  center?: boolean;
  zIndexRange?: [number, number];
  style?: React.CSSProperties;
  overlayRef?: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

/**
 * Lightweight, React 19-native 3D-to-2D HTML overlay component.
 * Uses native ReactDOM.createPortal instead of Drei's nested createRoot(),
 * completely eliminating unmount race conditions and removeChild errors.
 */
export const HtmlOverlay: React.FC<HtmlOverlayProps> = ({
  position = [0, 0, 0],
  center = true,
  zIndexRange = [15, 0],
  style,
  overlayRef: propOverlayRef,
  children,
}) => {
  const contextOverlayRef = useContext(HtmlOverlayContext);
  const overlayRef = propOverlayRef || contextOverlayRef;
  const { camera, size } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  // Persistent container element for this overlay item
  const [container] = useState(() => {
    if (typeof document === 'undefined') return null;
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.top = '0';
    el.style.left = '0';
    el.style.pointerEvents = 'auto';
    el.style.willChange = 'transform';
    return el;
  });

  // Attach and detach to overlay parent
  useLayoutEffect(() => {
    const parent = overlayRef.current;
    if (!parent || !container) return;
    parent.appendChild(container);

    return () => {
      if (container.parentNode === parent) {
        parent.removeChild(container);
      }
    };
  }, [overlayRef, container]);

  // Sync display / style changes
  useLayoutEffect(() => {
    if (!container) return;
    if (style?.display !== undefined) {
      container.style.display = style.display as string;
    } else {
      container.style.display = 'block';
    }
  }, [container, style?.display]);

  const worldPos = useMemo(() => new THREE.Vector3(), []);

  // Update 2D screen coordinate projection on every frame
  useFrame(() => {
    if (!container || !groupRef.current) return;

    // Get current world position of this 3D anchor
    groupRef.current.getWorldPosition(worldPos);

    // Project world coordinates (-1 to 1) onto camera projection plane
    worldPos.project(camera);

    // Occlude if behind camera
    if (worldPos.z > 1) {
      container.style.display = 'none';
      return;
    } else if (style?.display !== 'none') {
      container.style.display = 'block';
    }

    // Convert normalized device coordinates (NDC) to screen pixels
    const x = (worldPos.x * 0.5 + 0.5) * size.width;
    const y = (-worldPos.y * 0.5 + 0.5) * size.height;

    container.style.transform = `translate3d(${x}px, ${y}px, 0)${center ? ' translate(-50%, -50%)' : ''}`;
    container.style.zIndex = `${zIndexRange[0]}`;
  });

  if (!container || !overlayRef.current) return null;

  return (
    <>
      <group ref={groupRef} position={position} />
      {createPortal(children, container)}
    </>
  );
};
