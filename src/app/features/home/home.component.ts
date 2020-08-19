import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
const { width, height } = require("screenz");

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    // Status
    // 0 = default
    // 1 = processing
    // 2 = error
    // 3 = success
    public status;

    public canvas: HTMLCanvasElement;

    public video: HTMLVideoElement;
    public hideVideo: Boolean = false;

    width = 400;

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.status = 0;
        this.init_camera();
    }

    setStatus(status) {
        this.hideVideo = true;
        this.status = status;

        setTimeout( () => {
          this.status = 0;
          this.hideVideo = false
        }, 3000);
    }

    init_camera(): Promise<void> {
        return this.get_media()
            .then(this.on_get_media)
            .catch(this.on_error)
    }

    on_error = (reason: any) => { console.log(reason) }

    get_media(): Promise<MediaStream> {

        let constraints = { audio: false, video: true }
        return navigator.mediaDevices.getUserMedia(constraints)
    }

    on_get_media = (stream: MediaStream) => {
        this.video = document.querySelector('video')
        this.video.onloadedmetadata = () => { this.video.play() }
        this.video.oncanplay = () => { this.on_video_ready() }
        this.video.srcObject = stream
    }

    on_video_ready = () => {
        this.canvas = document.createElement('canvas')
        this.canvas.width = width
        this.canvas.height = this.video.videoHeight / (this.video.videoWidth / width)
        this.video.setAttribute('height', this.canvas.height.toString())
        this.video.setAttribute('width', this.canvas.width.toString())
    }

}
