'use client';
import CreativeEditorSDK from '@cesdk/cesdk-js';

import { useEffect, useRef } from 'react';

export const CESdk = ({ videoData }) => {
    const cesdk_container = useRef(null);
    
    useEffect(() => {
        let instance = null;
        
        const initEditor = async () => {
            if (!cesdk_container.current) return;
            
            const config = {
                license: 'tqZptlkivPqbJZEzzBVpv9-acoBS7MyE5FbN1xJ7DgO4-mB3xUp0RplR45rpEwtU',
                baseURL: 'https://cdn.img.ly/packages/imgly/cesdk-js/1.45.0/assets',
                callbacks: { onUpload: 'local' },
                ui: {
                    elements: {
                        navigation: {
                            action: { export: true, save: true },
                            items: { download: true }
                        },
                        panels: {
                            settings: true,
                            libraries: true
                        }
                    }
                }
            };
            
            try {
                instance = await CreativeEditorSDK.create(cesdk_container.current, config);
                instance.addDefaultAssetSources();
                instance.addDemoAssetSources({ sceneMode: 'Design' });
                
                // Create a new design scene
                await instance.createVideoScene({ width: 1920, height: 1080, unit: 'Pixel' });
                
                // If we have video data, we can load it here
                if (videoData) {
                    // Add custom logic to load video data
                    //   instance.loadFromURL(videoData.video_url);
                    console.log('Video data available:', videoData);
                }
            } catch (error) {
                console.error('Failed to initialize CE.SDK:', error);
            }
        };
        
        initEditor();
        
        return () => {
            if (instance) {
                instance.dispose();
            }
        };
    }, [videoData]);
    
    return (
        <div
        ref={cesdk_container}
        style={{ width: '100%', height: '100%' }}
        className="w-full h-full"
        ></div>
    );
};
