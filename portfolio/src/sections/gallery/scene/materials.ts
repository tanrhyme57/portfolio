import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { DoubleSide, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import { readCssColor } from '@/lib/cssColor';

/**
 * The greybox's few shared materials, coloured from CSS tokens. The paper of
 * the illusion is unlit on purpose: a piece that is darker because it is
 * farther away would give the trick away.
 */
export function useGalleryMaterials() {
  const element = useThree((state) => state.gl.domElement);
  const materials = useMemo(() => {
    const color = (token: string, fallback: string) => readCssColor(element, token, fallback);
    return {
      void: color('--gallery-void', '#141414'),
      plaster: new MeshStandardMaterial({
        color: color('--gallery-plaster', '#8d887f'),
        roughness: 0.95,
      }),
      hall: new MeshStandardMaterial({ color: color('--gallery-hall', '#121110'), roughness: 1 }),
      room: new MeshStandardMaterial({ color: color('--gallery-room', '#55514b'), roughness: 0.9 }),
      gold: new MeshStandardMaterial({
        color: color('--gallery-gold', '#c8a24a'),
        metalness: 0.55,
        roughness: 0.35,
      }),
      paper: new MeshBasicMaterial({
        color: color('--gallery-paper', '#efe9dc'),
        side: DoubleSide,
      }),
      slot: new MeshBasicMaterial({ color: color('--gallery-slot', '#f4f1ea') }),
    };
  }, [element]);

  useEffect(
    () => () => {
      for (const material of Object.values(materials)) {
        if ('dispose' in material) material.dispose();
      }
    },
    [materials],
  );
  return materials;
}

export type GalleryMaterials = ReturnType<typeof useGalleryMaterials>;
