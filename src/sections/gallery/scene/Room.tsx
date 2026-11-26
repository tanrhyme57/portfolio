import { useMemo } from 'react';
import { exitCentre, LAYOUT, projectSlots, ROOM_BACK_Z, ROOM_FLOOR_Y } from '../layout';
import { Block } from './Block';
import type { GalleryMaterials } from './materials';

const WALL = 0.15;

/** The gallery room: floor, three walls with an exit doorway, and six project frames. */
export function Room({ materials }: { materials: GalleryMaterials }) {
  const { width, depth, height, frontZ } = LAYOUT.room;
  const slots = useMemo(() => projectSlots(), []);
  const exit = exitCentre();
  const midZ = frontZ - depth / 2;
  const midY = ROOM_FLOOR_Y + height / 2;
  const backZ = ROOM_BACK_Z - WALL / 2;
  const sideOfExit = (width - LAYOUT.exit.width) / 2;
  const aboveExit = height - LAYOUT.exit.height;
  const { frame, image } = LAYOUT.slots;

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, ROOM_FLOOR_Y, midZ]} material={materials.room}>
        <planeGeometry args={[width, depth]} />
      </mesh>
      <Block
        size={[WALL, height, depth]}
        position={[-(width + WALL) / 2, midY, midZ]}
        material={materials.plaster}
      />
      <Block
        size={[WALL, height, depth]}
        position={[(width + WALL) / 2, midY, midZ]}
        material={materials.plaster}
      />
      <Block
        size={[sideOfExit, height, WALL]}
        position={[-(width - sideOfExit) / 2, midY, backZ]}
        material={materials.plaster}
      />
      <Block
        size={[sideOfExit, height, WALL]}
        position={[(width - sideOfExit) / 2, midY, backZ]}
        material={materials.plaster}
      />
      <Block
        size={[LAYOUT.exit.width, aboveExit, WALL]}
        position={[0, ROOM_FLOOR_Y + LAYOUT.exit.height + aboveExit / 2, backZ]}
        material={materials.plaster}
      />
      {/* Outline of the exit, so it reads as a doorway into the dark. */}
      <Block
        size={[LAYOUT.exit.width + 0.16, 0.08, 0.06]}
        position={[0, exit.y + LAYOUT.exit.height / 2 + 0.04, ROOM_BACK_Z + 0.03]}
        material={materials.paper}
      />

      {slots.map((slot, i) => {
        const wallOffset = slot.centre.clone().addScaledVector(slot.normal, frame.depth / 2);
        const imageOffset = slot.centre.clone().addScaledVector(slot.normal, frame.depth + 0.002);
        return (
          <group key={i}>
            <mesh position={wallOffset} rotation-y={slot.yaw} material={materials.gold}>
              <boxGeometry args={[frame.width, frame.height, frame.depth]} />
            </mesh>
            <mesh position={imageOffset} rotation-y={slot.yaw} material={materials.slot}>
              <planeGeometry args={[image.width, image.height]} />
            </mesh>
            <pointLight
              position={slot.centre
                .clone()
                .addScaledVector(slot.normal, 1.2)
                .setY(ROOM_FLOOR_Y + height - 0.3)}
              intensity={2.2}
              distance={3.2}
              color="#ffe2b8"
            />
          </group>
        );
      })}
    </group>
  );
}
