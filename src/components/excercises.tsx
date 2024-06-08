import * as THREE from 'three';
import { Draggable } from "./pneumatics-interactions/snap";
import { RoundedBox, Text } from "@react-three/drei";
import { Image } from '@react-three/drei'


const excercises = [
    {
        title: "Excercise 1",
        description: "The piston of a single-acting cylinder performs a positive movement in the event of pressing the push button and moves back to its starting position upon releasing the button.",
        image: "/file.png",
    },
    {
        title: "Excercise 2",
        description: "By connecting the valves in series, a simple AND logic can be created. The cylinder only operates if the first push button AND the second push button are pressed.",
        image: "/file2.png",
    }
];

export default function Excercises({ downState }: { downState: React.MutableRefObject<{ pointerId: number; pointToObjectOffset: THREE.Vector3; } | undefined> }) {
    return (
        excercises.map((excercise, index) => {
            return (
                <Draggable key={index} position={[index, 1.5, -0.5]} downState={downState}>
                    <group scale={[0.5, 0.5, 1]}>
                        {/* <mesh position={[0, 0.2, -0.05]} receiveShadow castShadow>
                            <boxGeometry args={[1.2, 1.8, 0.05]} />
                            <meshBasicMaterial color="white" />
                        </mesh> */}
                        <RoundedBox args={[1.2, 1.8, 0.05]} radius={0.005} smoothness={4} position={[0, 0.2, -0.05]} receiveShadow castShadow>
                            <meshBasicMaterial color="white" />
                        </RoundedBox>
                        <Text color="black" fontSize={0.1} position={[-0.27, 0.95, 0]} maxWidth={1} wrap="true">
                            {excercise.title}
                        </Text>
                        <Text color="black" fontSize={0.05} position={[0, 0.67, 0]} maxWidth={1} wrap="true">
                            {excercise.description}
                        </Text>
                        <Image url={excercise.image} position={[-0.02, -0.1, 0]} scale={[0.98, 1]} />
                    </group>
                </Draggable >
            );
        })
    );
}