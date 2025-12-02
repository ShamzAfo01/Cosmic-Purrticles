import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { UpdateInteractionCallback } from '../types';

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private onUpdate: UpdateInteractionCallback;
  private isActive: boolean = false;

  constructor(apiKey: string, onUpdate: UpdateInteractionCallback) {
    this.ai = new GoogleGenAI({ apiKey });
    this.onUpdate = onUpdate;
  }

  public async connect(videoElement: HTMLVideoElement) {
    if (this.isActive) return;
    
    const updateParticlesTool: FunctionDeclaration = {
      name: 'updateParticles',
      parameters: {
        type: Type.OBJECT,
        description: 'Updates the particle system based on hand gestures.',
        properties: {
          tension: {
            type: Type.NUMBER,
            description: 'Level of hand tension or closure (0 = open/relaxed, 1 = closed fist/tight).',
          },
          expansion: {
            type: Type.NUMBER,
            description: 'Distance between hands or general expansiveness of gesture (0 = close together, 1 = far apart).',
          },
        },
        required: ['tension', 'expansion'],
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 15 } // Lower framerate for API stability
        },
        audio: true // Audio is often required for the connection lifecycle even if not used
    });
    
    videoElement.srcObject = stream;
    await videoElement.play();

    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          console.log('Gemini Live API Connected');
          this.isActive = true;
          this.startVideoStreaming(videoElement);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.toolCall) {
            for (const fc of message.toolCall.functionCalls) {
              if (fc.name === 'updateParticles') {
                const { tension, expansion } = fc.args as any;
                this.onUpdate({ 
                    tension: Number(tension) || 0, 
                    expansion: Number(expansion) || 0 
                });
                
                // Send dummy response to acknowledge tool call
                this.sessionPromise?.then((session) => {
                   session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: 'ok' }
                      }
                   });
                });
              }
            }
          }
        },
        onclose: () => {
          console.log('Gemini Live API Closed');
          this.isActive = false;
        },
        onerror: (err) => {
          console.error('Gemini Live API Error:', err);
          this.isActive = false;
        }
      },
      config: {
        responseModalities: [Modality.AUDIO], // Required by API even if we only use tools
        tools: [{ functionDeclarations: [updateParticlesTool] }],
        systemInstruction: `
          You are a real-time vision controller for a particle system.
          Continuously analyze the video stream to detect the user's hands.
          
          1. Detect "Tension": 
             - If hands are open/relaxed -> tension = 0.
             - If hands are closed into fists -> tension = 1.
             - Interpolate between 0 and 1.
          
          2. Detect "Expansion":
             - If hands are touching or very close -> expansion = 0.
             - If hands are spread far apart to the sides -> expansion = 1.
             - Interpolate between 0 and 1.

          Call the 'updateParticles' tool frequently (at least 2-5 times per second) with the detected values. 
          Be responsive. If no hands are visible, set both to 0.
        `,
      },
    });
  }

  private startVideoStreaming(videoEl: HTMLVideoElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const FPS = 2; // Limit fps to avoid overwhelming the tool calling loop
    
    const intervalId = window.setInterval(() => {
        if (!this.isActive || !this.sessionPromise) {
            clearInterval(intervalId);
            return;
        }

        if (videoEl.videoWidth > 0) {
            canvas.width = videoEl.videoWidth * 0.5; // Scale down for bandwidth
            canvas.height = videoEl.videoHeight * 0.5;
            ctx?.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            
            const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
            
            this.sessionPromise.then((session) => {
                session.sendRealtimeInput({
                    media: {
                        mimeType: 'image/jpeg',
                        data: base64
                    }
                });
            });
        }
    }, 1000 / FPS);
  }

  public disconnect() {
    this.isActive = false;
    // session close logic if available in the future
    // Currently relying on page unload or just stopping the stream loop
  }
}
