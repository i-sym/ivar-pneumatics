import * as THREE from 'three';
import { Draggable } from "./pneumatics-interactions/snap";
import { RoundedBox, Text } from "@react-three/drei";
import { Image } from '@react-three/drei'


const examples = [
    {
        title: "Example 1",
        description: "Simple pneumatics cylinder actuation with a push button.",
        image: "/examples/example1.jpg",
    },
    {
        title: "Example 2",
        description: "and logic with two push buttons.",
        image: "/examples/example2.jpg",
    }
];

export default function Examples({ downState }: { downState: React.MutableRefObject<{ pointerId: number; pointToObjectOffset: THREE.Vector3; } | undefined> }) {
    return (
        <>
            {examples.map((excercise, index) => {
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
                            <Image url={excercise.image} position={[-0.02, -0.1, 0]} scale={[1, 1]} zoom={1.7} />
                        </group>
                    </Draggable >
                );
            })}
            <group rotation={[0, Math.PI / 2, 0]} position={[0, 0, -1]}>
                <Draggable position={[-1, 1.5, -0.5]} downState={downState}>
                    <group scale={[0.5, 0.5, 1]}>
                        {/* <mesh position={[0, 0.2, -0.05]} receiveShadow castShadow>
                            <boxGeometry args={[1.2, 1.8, 0.05]} />
                            <meshBasicMaterial color="white" />
                        </mesh> */}
                        <RoundedBox args={[1.2, 1.8, 0.05]} radius={0.005} smoothness={4} position={[0, 0.2, -0.05]} receiveShadow castShadow>
                            <meshBasicMaterial color="white" />
                        </RoundedBox>
                        <Text color="black" fontSize={0.08} position={[0, 1.05, 0]} >
                            Component terminals
                        </Text>
                        <Image url={'terminals.jpg'} position={[-0.02, 0.6, 0]} scale={[0.75, 0.75]} zoom={0.9} />
                        <Text color="black" fontSize={0.08} position={[0, 0.16, 0]}>
                            Tube conector and grabbing
                        </Text>
                        <Image url={'tubing.jpg'} position={[-0.02, -0.3, 0]} scale={[0.75, 0.75]} zoom={0.9} />
                    </group>
                </Draggable>
                <Draggable position={[-1.7, 1.5, -0.5]} downState={downState}>
                    <group scale={[0.5, 0.5, 1]}>
                        {/* <mesh position={[0, 0.2, -0.05]} receiveShadow castShadow>
                            <boxGeometry args={[1.2, 1.8, 0.05]} />
                            <meshBasicMaterial color="white" />
                        </mesh> */}
                        <RoundedBox args={[1.2, 1.8, 0.05]} radius={0.005} smoothness={4} position={[0, 0.2, -0.05]} receiveShadow castShadow>
                            <meshBasicMaterial color="white" />
                        </RoundedBox>
                        <Text color="black" fontSize={0.08} position={[0, 1.05, 0]} >
                            Component terminals
                        </Text>
                        <Image url={'conection1.jpg'} position={[-0.02, 0.6, 0]} scale={[0.75, 0.75]} zoom={0.9} />
                        <Text color="black" fontSize={0.08} position={[0, 0.16, 0]}>
                            Tube conector and grabbing
                        </Text>
                        <Image url={'conection2.jpg'} position={[-0.02, -0.3, 0]} scale={[0.75, 0.75]} zoom={0.9} />
                    </group>
                </Draggable>
            </group>
        </>

    );
}