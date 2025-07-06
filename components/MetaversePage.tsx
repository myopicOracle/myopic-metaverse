import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GoogleGenAI } from '@google/genai';

interface MetaversePageProps {
    onLogout: () => void;
}

const MetaversePage: React.FC<MetaversePageProps> = ({ onLogout }) => {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const scriptInitialized = useRef(false);

    useEffect(() => {
        if (scriptInitialized.current || !canvasContainerRef.current) {
            return;
        }
        scriptInitialized.current = true;

        const container = canvasContainerRef.current;
        let animationFrameId: number;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // --- START OF VANILLA JS SCRIPT ---

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);
        scene.fog = new THREE.Fog(0xf5f5f5, 10, 50);
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 1.6, 5);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // UI Elements
        const dialogueBox = document.getElementById('dialogue-box') as HTMLDivElement;
        const dialogueName = document.getElementById('dialogue-name') as HTMLHeadingElement;
        const dialogueContent = document.getElementById('dialogue-content') as HTMLDivElement;
        const dialogueOptions = document.getElementById('dialogue-options') as HTMLDivElement;
        const interactionPrompt = document.getElementById('interaction-prompt') as HTMLDivElement;
        const customQuestionInput = document.getElementById('custom-question-input') as HTMLInputElement;
        const customQuestionSubmit = document.getElementById('custom-question-submit') as HTMLButtonElement;
        
        // Floating text effect
        function createFloatingText(text: string, worldPos: THREE.Vector3) {
            const screenPos = worldPos.clone();
            screenPos.project(camera);
            
            const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;
            
            const div = document.createElement('div');
            div.className = 'floating-text';
            div.textContent = text;
            div.style.left = x + 'px';
            div.style.top = y + 'px';
            document.body.appendChild(div);
            
            setTimeout(() => div.remove(), 2000);
        }
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 15, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = -30;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);
        
        // Floor with pattern
        const floorGeometry = new THREE.PlaneGeometry(40, 40);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xdcdcdc,
            roughness: 0.7,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);
        
        // Add floor tiles pattern
        const tileGeometry = new THREE.PlaneGeometry(2, 2);
        const tileMaterial1 = new THREE.MeshStandardMaterial({ color: 0xe8e8e8 });
        const tileMaterial2 = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });
        
        for (let x = -20; x < 20; x += 2) {
            for (let z = -20; z < 20; z += 2) {
                const tile = new THREE.Mesh(tileGeometry, ((x + z) / 2) % 2 === 0 ? tileMaterial1 : tileMaterial2);
                tile.position.set(x + 1, 0.01, z + 1);
                tile.rotation.x = -Math.PI / 2;
                tile.receiveShadow = true;
                scene.add(tile);
            }
        }
        
        // Walls with windows
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf8f8f8,
            roughness: 0.9
        });
        
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.3,
            roughness: 0.1,
            metalness: 0.5
        });
        
        // Back wall with windows
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(40, 10), wallMaterial);
        backWall.position.set(0, 5, -20);
        backWall.receiveShadow = true;
        scene.add(backWall);
        
        for (let x = -15; x <= 15; x += 10) {
            const window = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), windowMaterial);
            window.position.set(x, 5, -19.9);
            scene.add(window);
        }
        
        const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(40, 10), wallMaterial);
        leftWall.position.set(-20, 5, 0);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = true;
        scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(40, 10), wallMaterial);
        rightWall.position.set(20, 5, 0);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.receiveShadow = true;
        scene.add(rightWall);
        
        const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.6, metalness: 0.1 });
        const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x404040, roughness: 0.3, metalness: 0.8 });
        
        function createDesk(x: number, z: number) {
            const deskGroup = new THREE.Group();
            const deskTop = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 1.5), woodMaterial);
            deskTop.position.y = 0.75;
            deskTop.castShadow = true;
            deskTop.receiveShadow = true;
            deskGroup.add(deskTop);
            const frameGeometry = new THREE.BoxGeometry(0.05, 0.7, 0.05);
            const framePositions = [[-1.45, 0.35, -0.7], [1.45, 0.35, -0.7], [-1.45, 0.35, 0.7], [1.45, 0.35, 0.7]];
            framePositions.forEach(pos => {
                const frame = new THREE.Mesh(frameGeometry, metalMaterial);
                frame.position.set(pos[0], pos[1], pos[2]);
                frame.castShadow = true;
                deskGroup.add(frame);
            });
            const monitorBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16), metalMaterial);
            monitorBase.position.set(0, 0.82, 0);
            deskGroup.add(monitorBase);
            const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.05), metalMaterial);
            monitorStand.position.set(0, 0.95, 0);
            deskGroup.add(monitorStand);
            const monitorScreen = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.05), new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1, metalness: 0.5 }));
            monitorScreen.position.set(0, 1.3, 0);
            deskGroup.add(monitorScreen);
            const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.15), metalMaterial);
            keyboard.position.set(0, 0.81, 0.3);
            deskGroup.add(keyboard);
            const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), new THREE.MeshStandardMaterial({ color: 0x333333 }));
            chairSeat.position.set(0, 0.5, 0.8);
            deskGroup.add(chairSeat);
            const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.05), new THREE.MeshStandardMaterial({ color: 0x333333 }));
            chairBack.position.set(0, 0.8, 1.02);
            deskGroup.add(chairBack);
            if (Math.random() > 0.5) {
                const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
                mug.position.set(Math.random() * 0.5 - 0.25, 0.85, Math.random() * 0.3);
                deskGroup.add(mug);
            }
            deskGroup.position.set(x, 0, z);
            return deskGroup;
        }
        
        const desk1 = createDesk(-10, -10);
        const desk2 = createDesk(0, -10);
        const desk3 = createDesk(10, -10);
        const desk4 = createDesk(-10, 5);
        const desk5 = createDesk(0, 5);
        const desk6 = createDesk(10, 5);
        scene.add(desk1, desk2, desk3, desk4, desk5, desk6);
        
        const whiteboardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });
        const whiteboard = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 0.1), whiteboardMaterial);
        whiteboard.position.set(0, 3, -19.8);
        whiteboard.castShadow = true;
        scene.add(whiteboard);
        
        const roombaGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const roombaMaterial = new THREE.MeshStandardMaterial({ color: 0x4169e1 });
        const roomba = new THREE.Mesh(roombaGeometry, roombaMaterial);
        roomba.position.set(5, 0.05, 5);
        roomba.userData = { velocity: new THREE.Vector3(0.05, 0, 0.05) };
        scene.add(roomba);
        
        const plantPot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x8b4513 }));
        plantPot.position.set(-15, 0.2, -15);
        scene.add(plantPot);
        const plantLeaves = new THREE.Mesh(new THREE.SphereGeometry(0.6, 6, 5), new THREE.MeshStandardMaterial({ color: 0x228b22 }));
        plantLeaves.position.set(-15, 0.8, -15);
        scene.add(plantLeaves);
        
        const plantPot2 = plantPot.clone();
        plantPot2.position.set(15, 0.2, -15);
        scene.add(plantPot2);
        const plantLeaves2 = plantLeaves.clone();
        plantLeaves2.position.set(15, 0.8, -15);
        scene.add(plantLeaves2);
        
        const plantPot3 = plantPot.clone();
        plantPot3.position.set(0, 0.2, 15);
        scene.add(plantPot3);
        const plantLeaves3 = plantLeaves.clone();
        plantLeaves3.position.set(0, 0.8, 15);
        scene.add(plantLeaves3);
        
        const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 1), woodMaterial);
        coffeeTable.position.set(-18, 0.4, 10);
        coffeeTable.castShadow = true;
        scene.add(coffeeTable);
        const coffeeMachine = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.3), metalMaterial);
        coffeeMachine.position.set(-18, 1.05, 10);
        scene.add(coffeeMachine);

        // --- Character Creation ---
        const characters: THREE.Group[] = [];
        
        function createCharacter(name: string, role: string, x: number, z: number, shirtColor: number, characterData: any) {
            const group = new THREE.Group();
            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.8, 8), new THREE.MeshStandardMaterial({ color: shirtColor }));
            torso.position.y = 0.6;
            torso.castShadow = true;
            group.add(torso);
            const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6);
            const armMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });
            const leftArm = new THREE.Mesh(armGeometry, armMaterial);
            leftArm.position.set(-0.3, 0.7, 0);
            leftArm.rotation.z = Math.PI / 8;
            group.add(leftArm);
            const rightArm = new THREE.Mesh(armGeometry, armMaterial);
            rightArm.position.set(0.3, 0.7, 0);
            rightArm.rotation.z = -Math.PI / 8;
            group.add(rightArm);
            const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 6);
            const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
            const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
            leftLeg.position.set(-0.15, 0.4, 0);
            group.add(leftLeg);
            const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
            rightLeg.position.set(0.15, 0.4, 0);
            group.add(rightLeg);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffdbac }));
            head.position.y = 1.25;
            head.castShadow = true;
            group.add(head);
            const hair = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 6), new THREE.MeshStandardMaterial({ color: characterData.hairColor }));
            hair.position.y = 1.35;
            hair.scale.y = 0.6;
            group.add(hair);
            const eyeGeometry = new THREE.SphereGeometry(0.03, 4, 4);
            const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            leftEye.position.set(-0.08, 1.25, 0.22);
            group.add(leftEye);
            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            rightEye.position.set(0.08, 1.25, 0.22);
            group.add(rightEye);
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 64;
            const context = canvas.getContext('2d');
            if (context) {
                context.fillStyle = 'rgba(255, 255, 255, 0.9)';
                context.fillRect(0, 0, 256, 64);
                context.fillStyle = 'black';
                context.font = 'bold 20px Arial';
                context.textAlign = 'center';
                context.fillText(name, 128, 25);
                context.font = '16px Arial';
                context.fillStyle = '#666';
                context.fillText(role, 128, 45);
            }
            const nameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
            nameSprite.position.y = 1.8;
            nameSprite.scale.set(2, 0.5, 1);
            group.add(nameSprite);
            group.position.set(x, 0, z);
            group.userData = { name, role, isBot: false, conversations: [], initialPosition: new THREE.Vector3(x, 0, z), targetPosition: new THREE.Vector3(x, 0, z), moveTimer: 0, isDancing: false, tripChance: 0.001, leftArm, rightArm, ...characterData };
            characters.push(group);
            return group;
        }

        function createGuideBot(name: string, role: string, x: number, z: number) {
            const group = new THREE.Group();
            const core = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.8 }));
            group.add(core);
            const ringGeometry = new THREE.TorusGeometry(0.5, 0.05, 8, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
            ring1.rotation.x = Math.PI / 2;
            group.add(ring1);
            const ring2 = ring1.clone();
            ring2.rotation.y = Math.PI / 2;
            group.add(ring2);
            group.position.set(x, 1.5, z);
            group.userData = { name, role, isBot: true, conversations: [], initialPosition: new THREE.Vector3(x, 1.5, z), targetPosition: new THREE.Vector3(x, 1.5, z), moveTimer: 0, ring1, ring2 };
            characters.push(group);
            return group;
        }
        
        const finn = createCharacter('Finn the Human', 'CEO', -10, -5, 0xe60000, { hairColor: 0x4a2d1b, personality: 'visionary and charismatic', quirk: 'gestures enthusiastically when talking about the metaverse' });
        const gary = createCharacter('Gary Xia', 'AI Engineer', 10, -5, 0x1a1a1a, { hairColor: 0x000000, personality: 'technical and precise', quirk: 'explains everything in terms of gas fees and smart contracts' });
        const jake = createCharacter('Jake the Dog', 'Biz Dev Associate', -10, 5, 0x0055b3, { hairColor: 0x594537, personality: 'energetic and people-focused', quirk: 'sees every feature as a new way to connect people' });
        const guideBot = createGuideBot('Guide Bot', 'AI Assistant', 0, 10);
        scene.add(finn, gary, jake, guideBot);

        // --- Player Controls & Movement ---
        const player={position:new THREE.Vector3(0,1.6,5),velocity:new THREE.Vector3(0,0,0),speed:.1,isDancing:!1};
        const keys:{[key:string]:boolean}={};

        const onKeyDown = (e:KeyboardEvent) => {
            if (document.activeElement === customQuestionInput) {
                if (e.key === 'Escape') {
                    dialogueBox.style.display = 'none';
                    currentCharacter = null;
                    if (document.pointerLockElement === renderer.domElement) {
                        document.exitPointerLock();
                    }
                }
                return;
            }
            
            keys[e.key.toLowerCase()] = true;
            keys[e.key] = true;
            
            if (e.key.toLowerCase() === 'e' && nearbyCharacter && dialogueBox.style.display !== 'block') {
                e.preventDefault();
                openDialogue(nearbyCharacter);
            }
            
            if (e.key === ' ' && dialogueBox.style.display !== 'block') {
                e.preventDefault();
                player.isDancing = true;
                createFloatingText("💃🕺", player.position);
            }

            if (e.key === 'Escape') {
                dialogueBox.style.display = 'none';
                currentCharacter = null;
                if (document.pointerLockElement === renderer.domElement) {
                    document.exitPointerLock();
                }
            }
            
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        };
        const onKeyUp = (e:KeyboardEvent) => {
            if (document.activeElement === customQuestionInput) return;
            keys[e.key.toLowerCase()] = false;
            keys[e.key] = false;
            if (e.key === ' ' && dialogueBox.style.display !== 'block') {
                player.isDancing = false;
            }
        };
        document.addEventListener("keydown",onKeyDown);
        document.addEventListener("keyup",onKeyUp);

        // --- Character AI & Dialogue System ---
        function updateCharacterMovement(character:THREE.Group,deltaTime:number){if(character.userData.isBot){character.userData.ring1.rotation.z+=.01,character.userData.ring2.rotation.x+=.01,character.position.y=character.userData.initialPosition.y+Math.sin(Date.now()*.001)*.1;return}if(Math.random()<character.userData.tripChance&&!character.userData.isDancing){character.rotation.x=Math.PI/4,character.position.y=.3,createFloatingText("Oof!",character.position),setTimeout(()=>{character.rotation.x=0,character.position.y=0},1e3),character.userData.tripChance=0,setTimeout(()=>{character.userData.tripChance=.001},5e3)}if(character!==currentCharacter&&!character.userData.isDancing){if(Math.random()<.001){character.userData.isDancing=!0,createFloatingText("🎵",character.position),setTimeout(()=>{character.userData.isDancing=!1},3e3)}character.userData.moveTimer-=deltaTime;if(character.userData.moveTimer<=0){const e=Math.random()*Math.PI*2,t=3+5*Math.random();character.userData.targetPosition=new THREE.Vector3(character.userData.initialPosition.x+Math.cos(e)*t,0,character.userData.initialPosition.z+Math.sin(e)*t),character.userData.targetPosition.x=Math.max(-18,Math.min(18,character.userData.targetPosition.x)),character.userData.targetPosition.z=Math.max(-18,Math.min(18,character.userData.targetPosition.z)),character.userData.moveTimer=5+5*Math.random()}const e=new THREE.Vector3().subVectors(character.userData.targetPosition,character.position);if(e.y=0,e.length()>.1){e.normalize(),character.position.add(e.multiplyScalar(.02)),character.lookAt(character.userData.targetPosition),character.rotation.x=0,character.rotation.z=0,character.userData.isDancing||(character.position.y=Math.abs(Math.sin(Date.now()*.005))*.05)}}else if(character===currentCharacter){character.lookAt(new THREE.Vector3(player.position.x,character.position.y,player.position.z)),character.rotation.x=0,character.rotation.z=0}}
        let currentCharacter:THREE.Group|null=null,nearbyCharacter:THREE.Group|null=null;
        function generateDialogueOptions(character:THREE.Group){const e=["What is the Web3 Metaverse?","How do the AI-powered avatars work?","Can I create my own avatar as an NFT?","Tell me about the Web3 login with MetaMask.","How does the virtual economy work?","What are knowledge-based roles and permissions?","What's the main goal of this project?","How will voice and video chat work in the space?"];return e.sort(()=>Math.random()-.5).slice(0,4)}
        function openDialogue(character:THREE.Group){currentCharacter=character,dialogueBox.style.display="block",dialogueName.textContent=`${character.userData.name} - ${character.userData.role}`;if(document.pointerLockElement===renderer.domElement){document.exitPointerLock()}const e=["Welcome to MyopicMetaverse! I'm "+character.userData.name+". We're building the future of digital interaction here.","Hi there! I'm "+character.userData.name+". Glad you're here to check out the Web3 Metaverse.","Hello! "+character.userData.name+" here. Ready to talk about the next generation of virtual worlds?"],t=["Greetings. I am the Guide Bot. I can provide information about the Web3 Metaverse platform.","Welcome. I am a MyopicMetaverse AI. Please ask me about our core features."];if(character.userData.conversations.length===0){const a=character.userData.isBot?t[Math.floor(Math.random()*t.length)]:e[Math.floor(Math.random()*e.length)];dialogueContent.innerHTML=`<p><strong>${character.userData.name}:</strong> ${a}</p>`}else{const e=character.userData.conversations[character.userData.conversations.length-1];dialogueContent.innerHTML=`<p><strong>You:</strong> ${e.user}</p><p><strong>${character.userData.name}:</strong> ${e.response}</p>`}const a=generateDialogueOptions(character);dialogueOptions.innerHTML="",a.forEach(e=>{const t=document.createElement("div");t.className="dialogue-option",t.textContent=e,t.onclick=()=>selectOption(e),dialogueOptions.appendChild(t)}),customQuestionInput.value="",setTimeout(()=>{customQuestionInput.focus()},100)}
        
        async function selectOption(option:string){
            if(!currentCharacter)return;
            dialogueContent.innerHTML+=`<p><strong>You:</strong> ${option}</p>`;
            dialogueContent.innerHTML+=`<p><strong>${currentCharacter.userData.name}:</strong> <span class="loading"></span></p>`;
            dialogueContent.scrollTop=dialogueContent.scrollHeight;
            dialogueOptions.style.pointerEvents="none";
            dialogueOptions.style.opacity="0.5";
            customQuestionInput.disabled = true;
            customQuestionSubmit.disabled = true;
            let responseText = "";
            try {
                const prompt = `You are roleplaying as ${currentCharacter.userData.name}, ${currentCharacter.userData.role} at MyopicMetaverse Inc.
Character traits: ${currentCharacter.userData.personality}, ${currentCharacter.userData.quirk}
User question: "${option}"

Important context: You are a key stakeholder at MyopicMetaverse Inc. Talk about the "Web3 Metaverse", a project that combines AI chatbots, 3D avatars (NFTs), Web3 login (MetaMask), and a virtual economy. Be enthusiastic and informative for a potential new user.

Respond as this character with professional enthusiasm in 50-80 words.

IMPORTANT: Output ONLY valid JSON:
{"response": "your character's response here"}`;
                const result = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-preview-04-17',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                let jsonStr = result.text.trim();
                const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
                const match = jsonStr.match(fenceRegex);
                if(match && match[2]) jsonStr = match[2].trim();
                const data = JSON.parse(jsonStr);
                responseText = data.response || "I'm not sure how to answer that. Try asking something else!";
            } catch(e) {
                console.error("API or JSON parsing Error:", e);
                responseText = generateFallbackResponse(currentCharacter, option);
            }
            currentCharacter.userData.conversations.push({user: option, response: responseText});
            dialogueContent.innerHTML = dialogueContent.innerHTML.replace('<span class="loading"></span>', responseText);
            dialogueContent.scrollTop = dialogueContent.scrollHeight;
            if (Math.random() < .2) createFloatingText("💡", currentCharacter.position);
            
            const newOptions = generateDialogueOptions(currentCharacter);
            dialogueOptions.innerHTML = "";
            newOptions.forEach(e=>{
                const t=document.createElement("div");
                t.className="dialogue-option";
                t.textContent=e;
                t.onclick=()=>selectOption(e);
                dialogueOptions.appendChild(t)
            });
            dialogueOptions.style.pointerEvents = "auto";
            dialogueOptions.style.opacity = "1";
            customQuestionInput.disabled = false;
            customQuestionSubmit.disabled = false;
            customQuestionInput.focus();
        }
        
        function generateFallbackResponse(character: THREE.Group, question: string) {
            const fallbackResponses = {
                Mario:{"metaverse":"The Web3 Metaverse is our vision for the future! It's an immersive world where you can socialize, work, and play. We're seamlessly blending AI, blockchain, and social interaction to create a truly next-generation digital experience. It's not just a platform; it's a new reality.","ai":"Our AI-powered avatars are game-changers. They're not just characters; they're intelligent beings you can talk to. They can be your personal guide, a friendly face in a virtual store, or even a digital twin that represents you. The possibilities are endless!","avatar":"Absolutely! Your identity is key. We want you to create a 3D avatar that's uniquely you. And by minting it as an NFT, you truly own your digital identity. It's about giving power and ownership back to the user, which is a core principle for us.","web3":"Security and user control are paramount. Using MetaMask for login means you get a secure, decentralized entry point into the metaverse. No more forgotten passwords! It's the Web3 way: your keys, your identity, your world. It's simple, safe, and powerful.","economy":"We're building a real, functioning digital economy. Powered by the blockchain, you'll be able to shop for virtual goods, send gifts to friends, and even offer services. It creates a dynamic and engaging world where your digital assets have real value and utility.","default":"That's a great question! At MyopicMetaverse, our goal is to push the boundaries of what's possible. The Web3 Metaverse is the culmination of that effort, bringing together the best of AI, Web3, and social platforms into one cohesive vision for the future."},
                'Gary Xia':{"metaverse":"From a technical view, the Web3 Metaverse is a decentralized application (dApp) that bridges a 3D frontend with multiple smart contracts on the backend. We're ensuring every interaction is secure, transparent, and recorded on-chain where it matters.","ai":"The AI avatars run on our proprietary chatbot tech, but their knowledge can be permissioned. Think of it like a smart contract defining what data the AI can access. This allows for secure, context-aware conversations that respect user privacy and roles.","avatar":"Yes, your avatar can be an ERC-721 token. We're building a minting contract that will allow you to customize its traits, which are stored in the NFT's metadata. This ensures your unique avatar is verifiably yours on the blockchain. The gas fees for minting will be optimized, of course.","web3":"The login flow uses a sign-in with Ethereum (SIWE) message. Your MetaMask wallet signs a message to prove ownership of your address, which we use to authenticate you. It's far more secure than traditional passwords and is the standard for Web3.","economy":"The economy runs on smart contracts. When you send a gift, you're essentially executing a transaction with an ERC-20 or ERC-721 token. This makes all transfers peer-to-peer and censorship-resistant. Every transaction is verifiable on-chain.","default":"Let's break that down. The core of it is a set of smart contracts governing identity, assets, and interactions. Everything is designed to be as trustless and decentralized as possible, giving users true ownership of their digital footprint in the metaverse."},
                Darwin:{"metaverse":"Think of the Web3 Metaverse as the ultimate social space! It's a place to connect with people in a more meaningful way than just a simple chat window. You can explore amazing environments, meet new friends, and have shared experiences together in real-time.","ai":"The AI avatars make the world feel alive! Imagine walking into a virtual shop and being greeted by a helpful AI assistant, or having an AI guide show you and your friends around a new area. They make the experience more interactive and fun for everyone.","avatar":"Your avatar is your social identity! Making it an NFT is so cool because it becomes a unique digital collectible that represents you. You can show it off to your friends, and it's completely yours. It's a great way to express yourself in the virtual world.","social":"That's the best part! With spatial voice and video chat, you can just walk up to someone and start talking, just like in real life. It makes conversations feel so natural and spontaneous. It's perfect for hosting events, meetups, or just hanging out.","economy":"The virtual economy is all about social interaction! You can send a cool digital gift to a friend for their birthday or tip a creator for their awesome virtual gallery. It adds a whole new layer to how we can interact and show appreciation for each other online.","default":"That's a great point! Ultimately, every feature we're building is about bringing people together. Whether it's through creating unique avatars, exploring together, or sharing gifts, our goal is to build a vibrant and connected community."},
                "Guide Bot":{"metaverse":"The Web3 Metaverse is a web-based virtual world integrating AI chatbots, customizable 3D avatars, social chat features, and a blockchain-based economy.","ai":"AI-powered avatars are intelligent agents capable of natural language conversation. They can serve as guides, assistants, or customer service representatives within the virtual environment.","avatar":"Users can create a unique 3D avatar. This avatar can be minted as a non-fungible token (NFT) to establish verifiable digital ownership.","web3":"Access is granted via a secure, wallet-based login using MetaMask. This method leverages Web3 technology for decentralized authentication without passwords.","economy":"The platform includes a virtual economy. Users can engage in blockchain-based transactions to shop, send money, or give digital gifts.","roles":"The system uses knowledge-based roles and permissions. This allows for granular control over what information and capabilities each user or AI avatar can access.","social":"The platform supports real-time voice and video chat with spatial audio, allowing for natural conversations as users move through the virtual environment.","default":"I can provide information on these core features: AI Avatars, Custom 3D Avatars, Web3 Login, Virtual Economy, and Role-Based Permissions. Please specify your topic of interest."}
            };
            type ResponseCategory = "metaverse" | "ai" | "avatar" | "web3" | "economy" | "roles" | "social" | "default";
            let topic: ResponseCategory = "default";
            const lowerCaseQuestion = question.toLowerCase();
            if (lowerCaseQuestion.includes("metaverse") || lowerCaseQuestion.includes("project") || lowerCaseQuestion.includes("goal")) { topic = "metaverse"; }
            else if (lowerCaseQuestion.includes("ai") || lowerCaseQuestion.includes("chatbot")) { topic = "ai"; }
            else if (lowerCaseQuestion.includes("avatar") || lowerCaseQuestion.includes("nft")) { topic = "avatar"; }
            else if (lowerCaseQuestion.includes("web3") || lowerCaseQuestion.includes("login") || lowerCaseQuestion.includes("metamask")) { topic = "web3"; }
            else if (lowerCaseQuestion.includes("economy") || lowerCaseQuestion.includes("shop") || lowerCaseQuestion.includes("gift")) { topic = "economy"; }
            else if (lowerCaseQuestion.includes("role") || lowerCaseQuestion.includes("permission")) { topic = "roles"; }
            else if (lowerCaseQuestion.includes("voice") || lowerCaseQuestion.includes("video") || lowerCaseQuestion.includes("social")) { topic = "social"; }
            const characterName = character.userData.name as keyof typeof fallbackResponses;
            const responses = fallbackResponses[characterName] || fallbackResponses['Guide Bot'];
            return (responses as any)[topic] || responses.default;
        }

        const onCustomQuestionSubmit = () => { const e=customQuestionInput.value.trim();if(e&&currentCharacter){selectOption(e),customQuestionInput.value=""} };
        customQuestionSubmit.addEventListener('click', onCustomQuestionSubmit);
        const onCustomQuestionKeypress = (e:KeyboardEvent) => { if (e.key === 'Enter') onCustomQuestionSubmit(); };
        customQuestionInput.addEventListener('keypress', onCustomQuestionKeypress);

        // --- Animation Loop & Rendering ---
        let lastTime=0;
        function animate(e:number){
            animationFrameId=requestAnimationFrame(animate);
            if(!lastTime) lastTime = e;
            const t=(e-lastTime)/1e3;
            lastTime=e;
            
            player.velocity.set(0,0,0);
            if(!player.isDancing&&dialogueBox.style.display!=="block"){if(keys.w)player.velocity.z=player.speed;if(keys.s)player.velocity.z=-player.speed;if(keys.a)player.velocity.x=-player.speed;if(keys.d)player.velocity.x=player.speed}

            const a=.05;
            if(dialogueBox.style.display!=="block"){if(keys.ArrowLeft)mouseX+=a;if(keys.ArrowRight)mouseX-=a}
            
            if(!player.isDancing&&dialogueBox.style.display!=="block"){camera.rotation.y=mouseX,camera.rotation.x=0}
            
            const o=new THREE.Vector3(0,0,-1);o.applyQuaternion(camera.quaternion),o.y=0,o.normalize();
            const r=new THREE.Vector3(1,0,0);r.applyQuaternion(camera.quaternion),r.y=0,r.normalize();
            
            player.position.add(o.multiplyScalar(player.velocity.z));
            player.position.add(r.multiplyScalar(player.velocity.x));
            player.position.x=Math.max(-18,Math.min(18,player.position.x));
            player.position.z=Math.max(-18,Math.min(18,player.position.z));
            
            if(player.isDancing&&dialogueBox.style.display!=="block"){camera.position.y=player.position.y+Math.sin(Date.now()*.01)*.2;camera.rotation.z=Math.sin(Date.now()*.01)*.1;camera.rotation.y=mouseX;camera.rotation.x=0}
            else{camera.position.copy(player.position);camera.rotation.z=0;if(dialogueBox.style.display!=="block"){camera.rotation.y=mouseX;camera.rotation.x=0}}
            
            characters.forEach(c=>{updateCharacterMovement(c,t);if(c.userData.isDancing){c.rotation.y+=.1,c.position.y=Math.abs(Math.sin(Date.now()*.01))*.3,c.userData.leftArm.rotation.z=Math.sin(Date.now()*.01)*.5+Math.PI/8,c.userData.rightArm.rotation.z=-Math.sin(Date.now()*.01)*.5-Math.PI/8}});
            
            roomba.rotation.y+=.05,roomba.position.add(roomba.userData.velocity);
            if(Math.abs(roomba.position.x)>18||Math.abs(roomba.position.z)>18){roomba.userData.velocity.multiplyScalar(-1),createFloatingText("Bonk!",roomba.position)}
            
            nearbyCharacter=null;
            let n=Infinity;
            characters.forEach(c=>{const dist=player.position.distanceTo(c.position);if(dist<3&&dist<n){n=dist,nearbyCharacter=c}});
            
            if(nearbyCharacter&&!currentCharacter){interactionPrompt.style.display="block",interactionPrompt.textContent=`Press E to talk to ${nearbyCharacter.userData.name}`}
            else{interactionPrompt.style.display="none"}
            
            renderer.render(scene,camera)
        }
        
        // --- Event Listeners & Initialisation ---
        let mouseX=0;
        const onResize = () => { camera.aspect = window.innerWidth / window.innerHeight, camera.updateProjectionMatrix(), renderer.setSize(window.innerWidth, window.innerHeight) };
        window.addEventListener('resize', onResize);
        const onMouseMove = (e:MouseEvent) => { if(document.pointerLockElement===renderer.domElement&&dialogueBox.style.display!=="block"){mouseX-=e.movementX*.002}};
        document.addEventListener('mousemove', onMouseMove);
        const onCanvasClick = () => { if(!dialogueBox.style.display||dialogueBox.style.display==="none"){renderer.domElement.requestPointerLock()} };
        renderer.domElement.addEventListener('click', onCanvasClick);
        
        animate(0);

        // --- END OF VANILLA JS SCRIPT ---

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', onResize);
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            document.removeEventListener('mousemove', onMouseMove);
            renderer.domElement.removeEventListener('click', onCanvasClick);
            customQuestionSubmit.removeEventListener('click', onCustomQuestionSubmit);
            customQuestionInput.removeEventListener('keypress', onCustomQuestionKeypress);
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <>
            <style>{`
                body { margin: 0; padding: 0; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000; }
                #canvas-container { width: 100vw; height: 100vh; position: relative; }
                #ui-overlay { position: absolute; top: 20px; left: 20px; color: white; background: rgba(0, 0, 0, 0.7); padding: 15px; border-radius: 10px; backdrop-filter: blur(10px); max-width: 300px; }
                #dialogue-box { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(255, 255, 255, 0.95); color: #333; padding: 20px; border-radius: 15px; max-width: 600px; width: 90%; display: none; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); backdrop-filter: blur(20px); }
                #dialogue-box h3 { margin: 0 0 10px 0; color: #D97356; }
                #dialogue-content { margin: 10px 0; line-height: 1.6; max-height: 200px; overflow-y: auto; }
                .dialogue-option { background: #f0f0f0; border: 2px solid #D97356; padding: 12px; margin: 8px 0; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
                .dialogue-option:hover { background: #D97356; color: white; transform: translateX(5px); }
                #custom-question-container { margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; }
                #custom-question-input { width: 100%; padding: 10px; border: 2px solid #D97356; border-radius: 8px; font-size: 14px; font-family: inherit; box-sizing: border-box; }
                #custom-question-submit { background: #D97356; color: white; border: none; padding: 10px 20px; border-radius: 8px; margin-top: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s; }
                #custom-question-submit:hover { background: #c85a3f; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); }
                #custom-question-submit:disabled { background: #999; cursor: not-allowed; transform: none; }
                .loading { display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(217, 115, 86, 0.3); border-radius: 50%; border-top-color: #D97356; animation: spin 1s ease-in-out infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .instruction { opacity: 0.8; font-size: 14px; margin-top: 10px; }
                #interaction-prompt { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.8); color: white; padding: 10px 20px; border-radius: 20px; display: none; font-size: 14px; }
                .floating-text { position: absolute; color: #ff0; font-size: 24px; font-weight: bold; pointer-events: none; animation: floatUp 2s ease-out forwards; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
                @keyframes floatUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-100px); } }
                #logout-button { background: #e60000; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; margin-top: 10px; }
            `}</style>
            <div ref={canvasContainerRef} id="canvas-container"></div>
            
            <div id="ui-overlay">
                <h1>🔮 Myopic Metaverse</h1>
                <p>Click to focus pointer</p>
                <p>Use WASD to move</p>
                <p>Mouse or Arrows keys to look</p>
                <p>E to interact, SPACE to dance</p>
                <p>ESC to regain pointer</p>
                <button id="logout-button" onClick={onLogout}>Sign Out</button>
            </div>
            
            <div id="dialogue-box">
                <h3 id="dialogue-name">Name</h3>
                <div id="dialogue-content">Content</div>
                <div id="dialogue-options"></div>
                <div id="custom-question-container">
                    <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.8, textAlign: 'center' }}>━━━ Or ask your own question ━━━</p>
                    <input type="text" id="custom-question-input" placeholder="Ask anything..." maxLength={200} />
                    <button id="custom-question-submit">Ask</button>
                </div>
            </div>
            
            <div id="interaction-prompt">Press E to talk</div>
        </>
    );
};

export default MetaversePage;
