import { useThree } from "@react-three/fiber";
import React from "react";
import { isXIntersection } from "@coconut-xr/xinteraction";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CubicBezierLine, QuadraticBezierLine } from "@react-three/drei";
import { PrimitiveAtom, useAtom, useSetAtom } from "jotai";
import {
  PneumapicTubeState,
  PneumaticComponentState,
} from "@/types/PneumaticTypes";
import { re } from "console";

const CableTip = React.forwardRef(
  (
    {
      downState,
      attachmentRef,
      position,
      onPut,
    }: {
      downState: React.MutableRefObject<{
        pointerId: number;
        pointToObjectOffset: THREE.Vector3;
      }>;
      attachmentRef: React.MutableRefObject<THREE.Object3D | null>;
      position: [number, number, number];
      onPut: (id: string | null) => void;
    },
    ref: React.ForwardedRef<THREE.Mesh>,
  ) => {
    const { scene } = useThree();

    return (
      <group
        userData={{
          kind: "snap-tag",
        }}
        onPointerDown={(e) => {
          if (
            ref.current != null &&
            downState.current == null &&
            isXIntersection(e)
          ) {
            e.stopPropagation();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            downState.current = {
              pointerId: e.pointerId,
              pointToObjectOffset: ref.current.position.clone().sub(e.point),
            };
          }
        }}
        onPointerUp={(e) => {
          if (downState.current?.pointerId != e.pointerId) {
            onPut(null);
            attachmentRef.current = null;
            return;
          }

          downState.current = null;

          // Check if there are any snappable objects in the scene by traversing closer than 0.1 units

          const snappableObjects: THREE.Object3D[] = [];

          scene.traverse((obj) => {
            if (obj.userData.kind === "snap-base") {
              snappableObjects.push(obj);
            }
          });

          // console.log('snappableObjects', snappableObjects)

          // Find the closest snappable object
          let closestObject: THREE.Object3D | undefined;
          let closestDistance = Infinity;

          for (const obj of snappableObjects) {
            if (obj === ref.current) {
              console.log("skipping self");
              continue;
            }

            const worldPosition = new THREE.Vector3();
            obj.getWorldPosition(worldPosition);

            const myWorldPosition = new THREE.Vector3();
            ref.current?.getWorldPosition(myWorldPosition);

            const distance = worldPosition.distanceTo(myWorldPosition);
            console.log("distance", distance);

            if (distance < closestDistance && distance < 0.3) {
              closestDistance = distance;
              closestObject = obj;
            }
          }

          // Snap to the closest object
          if (closestObject) {
            console.log("Attaching to", closestObject);
            attachmentRef.current = closestObject;
          } else {
            console.log("Not attaching to anything");
            attachmentRef.current = null;
          }

          onPut(closestObject?.userData.id || null);
        }}
        onPointerMove={(e) => {
          if (
            ref.current == null ||
            downState.current == null ||
            e.pointerId != downState.current.pointerId ||
            !isXIntersection(e)
          ) {
            return;
          }
          ref.current.position
            .copy(downState.current.pointToObjectOffset)
            .add(e.point);
        }}
        ref={ref}
        position={
          new THREE.Vector3(position[0], position[1] + 1, position[2] + 1)
        }
      >
        <mesh position={[0, 0.1, 0]} userData={{ kind: "snap-tag" }}>
          <cylinderGeometry args={[0.04, 0.04, 0.15, 32]} />
          <meshStandardMaterial color="blue" transparent opacity={0.5} />
        </mesh>
      </group>
    );
  },
);

CableTip.displayName = "CableTip";

export function Tube({
  downState,
  position,
  id,
  simulationState,
}: {
  downState: React.MutableRefObject<{
    pointerId: number;
    pointToObjectOffset: THREE.Vector3;
  }>;
  position: [number, number, number];
  id: string;
  simulationState: PneumapicTubeState;
}) {
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);
  const cableRef = useRef<THREE.CatmullRomCurve3>(null);
  const { scene } = useThree();

  const ref1AttachedTo = useRef<THREE.Object3D | null>(null);
  const ref2AttachedTo = useRef<THREE.Object3D | null>(null);

  const v1 = new THREE.Vector3(0, 1, 0);
  const v1Orientation = new THREE.Vector3(0, 2, 0);

  const v2 = new THREE.Vector3(0, 1, 0);
  const v2Orientation = new THREE.Vector3(0, 2, 0);

  console.log("Rebuilding tube", id);

  useFrame(() => {
    ref1.current?.getWorldPosition(v1);
    ref1.current?.getWorldDirection(v1Orientation);

    ref2.current?.getWorldPosition(v2);
    ref2.current?.getWorldDirection(v2Orientation);

    ref1.current?.getWorldPosition(v1);
    ref1.current?.getWorldDirection(v1Orientation);

    ref2.current?.getWorldPosition(v2);
    ref2.current?.getWorldDirection(v2Orientation);

    if (ref1AttachedTo.current) {
      const baseWorldPosition = new THREE.Vector3();
      const baseWorldQuaternion = new THREE.Quaternion();

      ref1AttachedTo.current.getWorldPosition(baseWorldPosition);
      ref1AttachedTo.current.getWorldQuaternion(baseWorldQuaternion);

      const baseWorldEuler = new THREE.Euler();
      baseWorldEuler.setFromQuaternion(baseWorldQuaternion);

      ref1.current?.rotation.copy(baseWorldEuler);

      ref1.current?.updateMatrixWorld();

      ref1.current?.position
        .copy(baseWorldPosition)
        .add(new THREE.Vector3(0, 0, 0));
    } else {
      ref1.current?.rotation.set(0, Math.PI / 6, 0);
      ref1.current?.updateMatrixWorld();
    }

    if (ref2AttachedTo.current) {
      const baseWorldPosition = new THREE.Vector3();
      const baseWorldQuaternion = new THREE.Quaternion();

      ref2AttachedTo.current.getWorldPosition(baseWorldPosition);
      ref2AttachedTo.current.getWorldQuaternion(baseWorldQuaternion);

      const baseWorldEuler = new THREE.Euler();
      baseWorldEuler.setFromQuaternion(baseWorldQuaternion);

      ref2.current?.rotation.copy(baseWorldEuler);

      ref2.current?.position
        .copy(baseWorldPosition)
        .add(new THREE.Vector3(0, 0, 0));

      ref2.current?.updateMatrixWorld();
    } else {
      ref2.current?.rotation.set(0, Math.PI / 6, 0);
      ref2.current?.updateMatrixWorld();
    }

    if (cableRef.current) {
      if (ref1.current && ref2.current) {
        const v1 = new THREE.Vector3();
        ref1.current.getWorldPosition(v1);

        const v2 = new THREE.Vector3();
        ref2.current.getWorldPosition(v2);

        cableRef.current.setPoints(v1, v2);
      }
    }
  });

  return (
    <group position={position}>
      <CableTip
        ref={ref1}
        attachmentRef={ref1AttachedTo}
        downState={downState}
        position={position}
        onPut={(id) => {
          simulationState.from = id || "atmosphere";
        }}
      />
      <CableTip
        ref={ref2}
        attachmentRef={ref2AttachedTo}
        downState={downState}
        position={position}
        onPut={(id) => {
          simulationState.to = id || "atmosphere";
        }}
      />

      <Cable start={ref1} end={ref2} v1={v1} v2={v2} />
    </group>
  );
}

function Cable({
  start,
  end,
  v1 = new THREE.Vector3(),
  v2 = new THREE.Vector3(),
}) {
  const ref = useRef();
  useFrame(
    () =>
      ref.current.setPoints(
        start.current.getWorldPosition(v1),
        end.current.getWorldPosition(v2),
      ),
    [],
  );
  return <QuadraticBezierLine ref={ref} lineWidth={3} color="#ff2060" />;
}
