import { useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import {
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
} from 'three';
import marbleColorUrl from '@/assets/textures/gallery/marble-color.webp';
import marbleNormalUrl from '@/assets/textures/gallery/marble-normal.webp';
import marbleRoughUrl from '@/assets/textures/gallery/marble-rough.webp';
import {
  exitCentre,
  LAYOUT,
  projectSlots,
  ROOM_BACK_Z,
  ROOM_CEILING_Y,
  ROOM_FLOOR_Y,
  ROOM_FRONT_Z,
} from '../layout';
import { Block } from './Block';
import { Chandelier } from './Chandelier';
import { PictureFrame } from './PictureFrame';
import type { GalleryMaterials } from './materials';

const WALL = 0.15;
/** Metres of floor one marble tile covers. */
const MARBLE_TILE = 2;

/** Height above the floor of the warm lights over each frame. */
const FRAME_LIGHT_HEIGHT = 3.3;

/**
 * The gallery room: marble floor, white walls with an exit doorway, a
 * chandelier and six project frames. The shell wraps the stairs and reaches
 * up to the hallway's ceiling, so the dark never shows past its edges.
 */
export function Room({ materials }: { materials: GalleryMaterials }) {
  const { width } = LAYOUT.room;
  const door = LAYOUT.hallway.door;
  const slots = useMemo(() => projectSlots(), []);
  const exit = exitCentre();
  const height = ROOM_CEILING_Y - ROOM_FLOOR_Y;
  const depth = ROOM_FRONT_Z - ROOM_BACK_Z;
  const midZ = ROOM_FRONT_Z - depth / 2;
  const midY = ROOM_FLOOR_Y + height / 2;
  const backZ = ROOM_BACK_Z - WALL / 2;
  const frontZ = ROOM_FRONT_Z - WALL / 2;
  const sideOfExit = (width - LAYOUT.exit.width) / 2;
  const aboveExit = height - LAYOUT.exit.height;
  const sideOfDoor = (width - door.width) / 2;
  const floor = useMarbleFloor(width / MARBLE_TILE, depth / MARBLE_TILE);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, ROOM_FLOOR_Y, midZ]} material={floor}>
        <planeGeometry args={[width, depth]} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, ROOM_CEILING_Y, midZ]} material={materials.wall}>
        <planeGeometry args={[width, depth]} />
      </mesh>
      <Block
        size={[WALL, height, depth]}
        position={[-(width + WALL) / 2, midY, midZ]}
        material={materials.wall}
      />
      <Block
        size={[WALL, height, depth]}
        position={[(width + WALL) / 2, midY, midZ]}
        material={materials.wall}
      />

      {/* Front wall, with the hallway's door opening onto the landing (at y = 0). */}
      <Block
        size={[sideOfDoor, height, WALL]}
        position={[-(width - sideOfDoor) / 2, midY, frontZ]}
        material={materials.wall}
      />
      <Block
        size={[sideOfDoor, height, WALL]}
        position={[(width - sideOfDoor) / 2, midY, frontZ]}
        material={materials.wall}
      />
      <Block
        size={[door.width, ROOM_CEILING_Y - door.height, WALL]}
        position={[0, (ROOM_CEILING_Y + door.height) / 2, frontZ]}
        material={materials.wall}
      />
      <Block
        size={[door.width, -ROOM_FLOOR_Y, WALL]}
        position={[0, ROOM_FLOOR_Y / 2, frontZ]}
        material={materials.wall}
      />

      {/* Back wall, around the exit. */}
      <Block
        size={[sideOfExit, height, WALL]}
        position={[-(width - sideOfExit) / 2, midY, backZ]}
        material={materials.wall}
      />
      <Block
        size={[sideOfExit, height, WALL]}
        position={[(width - sideOfExit) / 2, midY, backZ]}
        material={materials.wall}
      />
      <Block
        size={[LAYOUT.exit.width, aboveExit, WALL]}
        position={[0, ROOM_FLOOR_Y + LAYOUT.exit.height + aboveExit / 2, backZ]}
        material={materials.wall}
      />
      {/* Outline of the exit, so it reads as a doorway into the dark. */}
      <Block
        size={[LAYOUT.exit.width + 0.16, 0.08, 0.06]}
        position={[0, exit.y + LAYOUT.exit.height / 2 + 0.04, ROOM_BACK_Z + 0.03]}
        material={materials.paper}
      />

      <Chandelier rod={materials.gold} />

      {slots.map((slot, i) => (
        <group key={i}>
          <PictureFrame position={slot.centre} yaw={slot.yaw} picture={materials.slot} />
          <pointLight
            position={slot.centre
              .clone()
              .addScaledVector(slot.normal, 1.2)
              .setY(ROOM_FLOOR_Y + FRAME_LIGHT_HEIGHT)}
            intensity={2.2}
            distance={3.2}
            color="#ffe2b8"
          />
        </group>
      ))}
    </group>
  );
}

/** Polished marble, tiled across the floor. */
function useMarbleFloor(repeatX: number, repeatY: number) {
  const loaded = useLoader(TextureLoader, [marbleColorUrl, marbleNormalUrl, marbleRoughUrl]);
  return useMemo(() => {
    // Clones, so the cached textures stay untouched.
    const [color, normal, rough] = loaded.map((texture) => texture.clone());
    if (!color || !normal || !rough) throw new Error('Marble textures missing');
    for (const map of [color, normal, rough]) {
      map.wrapS = map.wrapT = RepeatWrapping;
      map.repeat.set(repeatX, repeatY);
      map.anisotropy = 8;
    }
    color.colorSpace = SRGBColorSpace;
    return new MeshStandardMaterial({
      map: color,
      normalMap: normal,
      normalScale: new Vector2(0.4, 0.4),
      roughnessMap: rough,
      roughness: 0.6,
      metalness: 0,
    });
  }, [loaded, repeatX, repeatY]);
}
