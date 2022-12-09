import { Object3D } from 'three';
export default class NFTaddTJS {
    private entities;
    private names;
    private scene;
    private uuid;
    constructor(uuid: string);
    add(mesh: Object3D, name: string, objVisibility: boolean): void;
    addModel(url: string, name: string, scale: number, objVisibility: boolean, callback: (model: any, anim: any) => void): void;
    addImage(imageUrl: string, name: string, color: string, scale: number, objVisibility: boolean, callback: (plane: any) => void): void;
    addVideo(id: string, name: string, alpha: boolean, scale: number, objVisibility: boolean, callback: (plane: any) => void): void;
    addGif(imageUrl: string, name: string, color: string, scale: number, objVisibility: boolean, callback: (plane: any) => void): void;
    getNames(): string[];
}
