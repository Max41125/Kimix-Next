'use client'
import React, { useCallback } from 'react'
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";


const ParticlesBackground = ({ children }) => {
    const particlesInit = useCallback(async engine => {
        console.log(engine);
        await loadSlim(engine);

    }, []);

    const particlesLoaded = useCallback(async container => {
        await console.log(container);
    }, []);


    return (

        <>
        <div className='relative  w-full h-full'>
            <Particles
                id="tsparticles"
                init={particlesInit}
                loaded={particlesLoaded}
                className='absolute top-0 left-0 w-full h-full -z-10'
                options={{
                    particles: {
                        number: {
                          value: 80,
                          density: {
                            enable: true,
                            area: 800
                          }
                        },
                        color: {
                          value: ["#14D8B5", "#101820  ", "#1B9AAA ", "#F2F2F2 "]
                        },
                        shape: {
                          type: "circle"
                        },
                        opacity: {
                          value: 1
                        },
                        size: {
                          value: { min: 1, max: 8 }
                        },
                        links: {
                          enable: true,
                          distance: 150,
                          color: "#808080",
                          opacity: 0.4,
                          width: 1
                        },
                        move: {
                          enable: true,
                          speed: 5,
                          direction: "none",
                          random: false,
                          straight: false,
                          outModes: "out"
                        }
                      },
                      interactivity: {
                        events: {
                          onHover: {
                            enable: true,
                            mode: "grab"
                          },
                          onClick: {
                            enable: true,
                            mode: "push"
                          }
                        },
                        modes: {
                          grab: {
                            distance: 140,
                            links: {
                              opacity: 1
                            }
                          },
                          push: {
                            quantity: 4
                          }
                        }
                      }
                  }}

            />
            {children}

        </div>
        </>



    )
}

export default ParticlesBackground