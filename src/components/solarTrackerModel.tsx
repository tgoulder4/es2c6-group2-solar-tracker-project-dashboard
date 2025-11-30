import { Canvas, useLoader, useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from '@react-three/drei'

type Props = {}

function SolarTrackerModel({ }: Props) {
    const url = "./model.stl";
    const geom = useLoader(STLLoader, url);

    const ref = useRef<any>(null);
    const { camera } = useThree();

    useEffect(() => {
        camera.lookAt(ref.current.position);
    }, [])


    // const scene = new THREE.Scene();
    // scene.add(new THREE.AxesHelper(5));

    // const light = new THREE.SpotLight();
    // light.position.set(20, 20, 20);
    // scene.add(light);

    // const dim = { width: 100, height: 100 }
    // const camera = new THREE.PerspectiveCamera(
    //     75, dim.width, dim.height
    // );
    // const renderer = new THREE.WebGLRenderer();
    // renderer.setSize(dim.width, dim.height);
    // camera.position.z = 4;

    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;

    // useEffect(() => {
    //     async function main() {
    //         const loader = new STLLoader();
    //         const geometry = await loader.loadAsync('/model.stl');
    //         scene.add(new THREE.Mesh(geometry));

    //         renderer.setClearColor(0xffffff, 1);
    //         document.getElementById("model")?.appendChild(renderer.domElement);
    //         renderer.render(scene, camera);
    //     }
    //     main();
    // }, []);
    return (
        // <div id="model">SolarTrackerModel</div>
        <mesh ref={ref}>
            <directionalLight position={[3.3, 1.0, 4.4]}
                castShadow
                intensity={Math.PI * 2} />
            <primitive object={geom} attach="geometry" />
            <meshStandardMaterial color="gray" />
        </mesh>
    )
}

export default SolarTrackerModel