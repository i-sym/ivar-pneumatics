"use client";
import { XRCanvas, PointerHand, PointerController, Hands, Controllers, } from "@coconut-xr/natuerlich/defaults";
import { use, useEffect, useRef, useState } from "react";
import { useEnterXR, NonImmersiveCamera, ImmersiveSessionOrigin, useInputSources, useXR, } from "@coconut-xr/natuerlich/react";
import { isXIntersection } from "@coconut-xr/xinteraction";
import * as THREE from "three";
import { Box, Environment, GizmoHelper, GizmoViewport, OrbitControls, QuadraticBezierLine, Text, } from "@react-three/drei";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import consolere from "console-remote-client";
import React from "react";
import { atom, PrimitiveAtom, useAtom } from "jotai";
import { splitAtom } from "jotai/utils";
import { Tube } from "@/components/pinematiks/tube";
import { SnapBase, Draggable } from "@/components/pneumatics-interactions/snap";
import { PneumaticButton, PneumaticCompressor, PneumaticMuptiplier, PneumaticPiston } from "@/components/pinematiks/3d-components";
import { PneumapicTubeState, PneumaticComponentDescription, PneumaticButtonState, PneumaticComponentKind, PneumaticComponentState, PneumaticCylinderState, PneumaticPipeDescription, PneumaticSplitterState, PneumaticState, } from "@/types/PneumaticTypes";
import { GltfModel } from "@/components/mesh-loader";
import { title } from "process";
import Excercises from "@/components/excercises";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "hand-tracking"],
};

consolere.connect({
  server: "https://console.re", // optional, default: https://console.re
  channel: "4da2-21a5-da26", // required
  redirectDefaultConsoleToRemote: true, // optional, default: false
  disableDefaultConsoleOutput: true, // optional, default: false
});

const initialPneumaticComponentSet: PneumaticComponentState[] = [
  {
    _id: "Pressure source 1",
    _kind: "compressor",
    terminalPressures: { 1: 0 },
    alert: null,
    connectedTubes: [],
  },
  // {
  //   _id: "Splitter1",
  //   _kind: "splitter",
  //   alert: null,
  //   terminalPressures: { 1: 0, 2: 0, 3: 0 },
  //   connectedTubes: [],
  // },
  {
    _id: "Valve with push button 1",
    _kind: "button",
    leftPressed: false,
    rightPressed: false,
    alert: null,
    terminalPressures: { 1: 0, 2: 0, 3: 0, 4: 0 },
    connectedTubes: [],
  },
  {
    _id: "Spring loaded Single acting cylinder 1",
    _kind: "cylinder",
    expansion: 0,
    alert: null,
    terminalPressures: { 1: 0 },
    connectedTubes: [],
  },
  {
    _id: "Spring loaded Single acting cylinder 2",
    _kind: "cylinder",
    expansion: 0,
    alert: null,
    terminalPressures: { 1: 0 },
    connectedTubes: [],
  },
];

const initialTubeSet: PneumapicTubeState[] = [
  { id: "tube1", from: "atmosphere", to: "atmosphere", residualMass: 0 },
  { id: "tube2", from: "atmosphere", to: "atmosphere", residualMass: 0 },
  { id: "tube3", from: "atmosphere", to: "atmosphere", residualMass: 0 },
  { id: "tube4", from: "atmosphere", to: "atmosphere", residualMass: 0 },
  { id: "tube5", from: "atmosphere", to: "atmosphere", residualMass: 0 },
  { id: "tube6", from: "atmosphere", to: "atmosphere", residualMass: 0 },
];

function PneumaticComponent({
  description,
  simulationState,
}: {
  description: PneumaticComponentState;
  simulationState: PneumaticComponentState;
}) {
  //const [description] = useAtom(atom);
  console.log("PneumaticComponentRererender", description._id);
  const id = description._id;

  switch (description._kind) {
    case "compressor":
      return (
        <group>
          <PneumaticCompressor
            id={id}
            state={simulationState as PneumaticCompressorState}
          />
          <PneumaticComponentStateViz id={"1"} description={description} />
          {/* sphere geometry */}
          <mesh position={[0, 0.35, 0]} receiveShadow castShadow>
            <meshBasicMaterial color="red" />
          </mesh>
        </group>
      );
    case "button":
      return (
        <group>
          <PneumaticButton
            id={id}
            state={simulationState as PneumaticButtonState}
          />
          <PneumaticComponentStateViz id={"2"} description={description} />
          <mesh position={[0, 0.45, 0]} receiveShadow castShadow>
            <meshBasicMaterial color="red" />
          </mesh>
        </group>
      );

    case "cylinder":
      return (
        <group>
          <PneumaticPiston
            id={id}
            state={simulationState as PneumaticCylinderState}
          />
          <PneumaticComponentStateViz id={"3"} description={description} />
          <mesh position={[0, 0.35, 0]} receiveShadow castShadow>
            <meshBasicMaterial color="red" />
          </mesh>
        </group>
      );
    case "splitter":
      return (
        <group>
          <PneumaticMuptiplier
            id={id}
            numberOfTerminals={3}
            state={simulationState as PneumaticSplitterState}
          />
          <PneumaticComponentStateViz id={"4"} description={description} />
          <mesh position={[0, 0.35, 0]} receiveShadow castShadow>
            <meshBasicMaterial color="red" />
          </mesh>
        </group>
      );
  }
}

function PneumaticComponentStateViz({
  id,
  description,
}: {
  id: string;
  description: PneumaticComponentState;
}) {
  const textRef = useRef<THREE.Mesh>();
  const [text, setText] = useState("OO");

  useFrame(() => {
    if (!textRef.current) return;

    const formmattedText = `${description._id}\n\nTerminal Pressures:\n${Object.entries(description.terminalPressures).map(([id, value], index) => id + ": " + value.toFixed(2) + "\n")}`;

    const newText = formmattedText;

    if (newText !== text || text === "OO") {
      setText(newText);
    }
  });

  useEffect(() => {
    console.log("PneumaticComponentStateViz", id);
  }, [text]);

  useEffect(() => {
    setText(JSON.stringify(description, null, 2));
  }, []);

  return (
    <Text position={[0, 0, 0.18]} scale={0.02} ref={textRef}>
      {text}
    </Text>
  );
}

function findTubeAttachedToComponent(componentId: string, terminalId: string) {
  return initialTubeSet.filter((tube) => {
    return (
      tube.from === `${componentId}/${terminalId}` ||
      tube.to === `${componentId}/${terminalId}`
    );
  });
}

function residualMassToPressure(residualMass: number) {
  return residualMass;
}

function iterateSimulation(
  pneumaticComponents: PneumaticComponentState[],
  pneumaticTubes: PneumapicTubeState[],
) {
  console.log(pneumaticComponents);

  // Clear all pipes connected to atmosphere
  pneumaticTubes.forEach((tube) => {
    if (tube.from === "atmosphere" || tube.to === "atmosphere") {
      tube.residualMass = 0;
    }
  });

  pneumaticComponents.forEach((component) => {
    if (component._kind === "compressor") {
      const compressor = component as PneumaticCompressorState;

      const tubesAtTerminal1 = findTubeAttachedToComponent(component._id, "1");

      component.connectedTubes = tubesAtTerminal1.map((tube) => tube.id);

      let tube: PneumapicTubeState = {
        id: "atmosphere",
        from: "atmosphere",
        to: "atmosphere",
        residualMass: 0,
      };

      if (tubesAtTerminal1.length > 1) {
        compressor.alert = true;
        return;
      } else if (tubesAtTerminal1.length === 0) {
        compressor.alert = true;
      } else {
        compressor.alert = false;
        tube = tubesAtTerminal1[0];
      }

      const pressure = residualMassToPressure(tube.residualMass);
      compressor.terminalPressures[1] = pressure;

      const supplyPressure = 3;

      const pressureDifference = supplyPressure - pressure;

      if (pressureDifference > 0) {
        tube.residualMass += pressureDifference * 0.3;
      }
    } else if (component._kind === "button") {
      const button = component as PneumaticButtonState;

      const tubesAtTerminal1 = findTubeAttachedToComponent(component._id, "1");
      const tubesAtTerminal2 = findTubeAttachedToComponent(component._id, "2");
      const tubesAtTerminal3 = findTubeAttachedToComponent(component._id, "3");
      const tubesAtTerminal4 = findTubeAttachedToComponent(component._id, "4");

      let tube1: PneumapicTubeState = {
        id: "atmosphere",
        from: "atmosphere",
        to: "atmosphere",
        residualMass: 0,
      };

      let tube2: PneumapicTubeState = {
        id: "atmosphere",
        from: "atmosphere",
        to: "atmosphere",
        residualMass: 0,
      };

      let tube3: PneumapicTubeState = {
        id: "atmosphere",
        from: "atmosphere",
        to: "atmosphere",
        residualMass: 0,
      };

      let tube4: PneumapicTubeState = {
        id: "atmosphere",
        from: "atmosphere",
        to: "atmosphere",
        residualMass: 0,
      };

      if (tubesAtTerminal1.length > 1) {
        button.alert = "Multiple tubes connected to terminal 1";
        return;
      } else if (tubesAtTerminal1.length === 0) {
        button.alert = "No tubes connected to terminal 1";
      } else {
        button.alert = null;
        tube1 = tubesAtTerminal1[0];
      }

      if (tubesAtTerminal2.length > 1) {
        button.alert = "Multiple tubes connected to terminal 2";
        return;
      } else if (tubesAtTerminal2.length === 0) {
        button.alert = "No tubes connected to terminal 2";
      } else {
        button.alert = null;
        tube2 = tubesAtTerminal2[0];
      }

      if (tubesAtTerminal3.length > 1) {
        button.alert = "Multiple tubes connected to terminal 3";
        return;
      } else if (tubesAtTerminal3.length === 0) {
        button.alert = "No tubes connected to terminal 3";
      } else {
        button.alert = null;
        tube3 = tubesAtTerminal3[0];
      }

      if (tubesAtTerminal4.length > 1) {
        button.alert = "Multiple tubes connected to terminal 4";
        return;
      } else if (tubesAtTerminal4.length === 0) {
        button.alert = "No tubes connected to terminal 4";
      } else {
        button.alert = null;
        tube4 = tubesAtTerminal4[0];
      }

      const pressure1 = residualMassToPressure(tube1.residualMass);
      const pressure2 = residualMassToPressure(tube2.residualMass);

      const pressureDifference12 = pressure1 - pressure2;

      const pressure3 = residualMassToPressure(tube3.residualMass);
      const pressure4 = residualMassToPressure(tube4.residualMass);

      const pressureDifference34 = pressure3 - pressure4;

      button.terminalPressures[1] = pressure1;
      button.terminalPressures[2] = pressure2;
      button.terminalPressures[3] = pressure3;
      button.terminalPressures[4] = pressure4;

      if (button.leftPressed) {
        tube1.residualMass += -pressureDifference12 * 0.3;
        tube2.residualMass += pressureDifference12 * 0.3;
      } else {
        tube2.residualMass += -pressure2 * 0.3;
      }

      if (button.rightPressed) {
        tube3.residualMass += -pressureDifference34 * 0.3;
        tube4.residualMass += pressureDifference34 * 0.3;
      } else {
        tube4.residualMass += -pressure4 * 0.3;
      }
    } else if (component._kind === "cylinder") {
      const cylinder = component as PneumaticCylinderState;

      const tubesAtTerminal1 = findTubeAttachedToComponent(component._id, "1");

      let tube: PneumapicTubeState = {
        id: "atmosphere",
        from: "atmosphere",
        to: "atmosphere",
        residualMass: 0,
      };

      if (tubesAtTerminal1.length > 1) {
        cylinder.alert = true;
        return;
      } else if (tubesAtTerminal1.length === 0) {
        cylinder.alert = true;
      } else {
        cylinder.alert = false;
        tube = tubesAtTerminal1[0];
      }

      const pressure = residualMassToPressure(tube.residualMass);

      cylinder.terminalPressures[1] = pressure;

      // Set expansion proportional to pressure
      cylinder.expansion = pressure / 1.5;
    } else if (component._kind === "splitter") {
      const splitter = component as PneumaticSplitterState;

      const tubesAtTerminal1 = findTubeAttachedToComponent(component._id, "1");
      const tubesAtTerminal2 = findTubeAttachedToComponent(component._id, "2");
      const tubesAtTerminal3 = findTubeAttachedToComponent(component._id, "3");

      let tube1: PneumapicTubeState = {
        id: "atmosphere",
        from: "atmosphere",
        to: "atmosphere",
        residualMass: 0,
      };

      let tube2: PneumapicTubeState = {
        id: "atmosphere",
        from: "atmosphere",
        to: "atmosphere",
        residualMass: 0,
      };

      let tube3: PneumapicTubeState = {
        id: "atmosphere",
        from: "atmosphere",
        to: "atmosphere",
        residualMass: 0,
      };

      if (tubesAtTerminal1.length > 1) {
        splitter.alert = true;
        return;
      } else if (tubesAtTerminal1.length === 0) {
        splitter.alert = true;
      } else {
        splitter.alert = false;
        tube1 = tubesAtTerminal1[0];
      }

      if (tubesAtTerminal2.length > 1) {
        splitter.alert = true;
        return;
      } else if (tubesAtTerminal2.length === 0) {
        splitter.alert = true;
      } else {
        splitter.alert = false;
        tube2 = tubesAtTerminal2[0];
      }

      if (tubesAtTerminal3.length > 1) {
        splitter.alert = true;
        return;
      } else if (tubesAtTerminal3.length === 0) {
        splitter.alert = true;
      } else {
        splitter.alert = false;
        tube3 = tubesAtTerminal3[0];
      }

      const pressure1 = residualMassToPressure(tube1.residualMass);
      const pressure2 = residualMassToPressure(tube2.residualMass);
      const pressure3 = residualMassToPressure(tube3.residualMass);

      splitter.terminalPressures[1] = pressure1;
      splitter.terminalPressures[2] = pressure2;
      splitter.terminalPressures[3] = pressure3;

      const pressureDifference12 = pressure1 - pressure2;
      const pressureDifference23 = pressure2 - pressure3;
      const pressureDifference13 = pressure1 - pressure3;

      tube1.residualMass += -pressureDifference12 * 0.3;
      tube2.residualMass += pressureDifference12 * 0.3;

      tube2.residualMass += -pressureDifference23 * 0.3;
      tube3.residualMass += pressureDifference23 * 0.3;

      tube1.residualMass += -pressureDifference13 * 0.3;
      tube3.residualMass += pressureDifference13 * 0.3;
    }
  });
}

function SimulationRunner({
  components,
  tubes,
}: {
  components: PneumaticComponentState[];
  tubes: PneumapicTubeState[];
}) {
  useEffect(() => {
    const interval = setInterval(() => {
      iterateSimulation(components, tubes);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return null;
}

const pneumaticComponentsState = {
  current: initialPneumaticComponentSet,
};
const pneumaticTubesState = {
  current: initialTubeSet,
};

function SimulationInfoIndicator({ tubes }: { tubes: PneumapicTubeState[] }) {
  const ref = useRef<THREE.Mesh>();

  const [text, setText] = useState("0");

  useFrame(() => {
    if (!ref.current) return;
    // Set text to JSON stringified tubes
    const newText = JSON.stringify(tubes, null, 2);

    if (newText !== text) {
      setText(newText);
    }
  });

  // Set position to camera position
  // console.log("Remounted Text");

  return (
    <group>
      <Text position={[0, 1, 0]} scale={0.02} ref={ref}>
        {text}
      </Text>
    </group>
  );
}


export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const inputSources = useInputSources();
  const downState = useRef<{
    pointerId: number;
    pointToObjectOffset: THREE.Vector3;
  }>();

  const objectRefs = useRef<{
    [id: string]: React.MutableRefObject<THREE.Object3D>;
  }>({});

  const debugTextRef = useRef<THREE.Mesh>();

  console.log("Rebuilding");

  return (
    <div className="h-screen w-full">
      <button
        onClick={enterAR}
        className=" left-8 top-8 size-32 rounded-lg border bg-white shadow-lg"
      >
        Enter AR
      </button>
      <XRCanvas>
        <Environment preset="city" />
        <SimulationRunner
          components={pneumaticComponentsState.current}
          tubes={pneumaticTubesState.current}
        />

        <Excercises downState={downState} />

        <group>
          {pneumaticComponentsState.current.map((component, index) => {
            return (
              <Draggable
                key={index}
                position={[index * 0.5, 1, 0]}
                downState={downState}
              >
                <PneumaticComponent
                  simulationState={component}
                  description={initialPneumaticComponentSet[index]}
                />
              </Draggable>
            );
          })}

          {pneumaticTubesState.current.map((tube, index) => {
            const initialDescription = initialTubeSet[index];
            return (
              <Tube
                key={index}
                downState={downState}
                id={initialDescription.id}
                position={[0, 0, 0]}
                simulationState={tube}
              />
            );
          })}
        </group>

        {/* <SimulationInfoIndicator tubes={pneumaticTubesState.current} /> */}

        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 1]}>
          <Hands
            type="grab"
            filterIntersections={(intersections) => {
              return intersections.filter((intersection) => {
                if (!intersection.point) return false;
                if (
                  !(
                    intersection.point.y &&
                    intersection.point.x &&
                    intersection.point.z
                  )
                )
                  return false;

                return true;
              });
            }}
          />
          <Controllers type="grab"
            filterIntersections={(intersections) => {
              return intersections.filter((intersection) => {
                if (!intersection.point) return false;
                if (
                  !(
                    intersection.point.y &&
                    intersection.point.x &&
                    intersection.point.z
                  )
                )
                  return false;

                return true;
              });
            }} />
        </ImmersiveSessionOrigin>
      </XRCanvas>
    </div >
  );
}

