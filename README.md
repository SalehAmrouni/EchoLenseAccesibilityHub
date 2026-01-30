ECHOLENS: Comprehensive Technical Design & Project Documentation
Project Leads: Sharifa Amrouni & Saleh Amrouni
Development Timeline: December 20, 2025 – January 5, 2026
Project Category: AI-Driven Assistive Technology / Inclusive Design / Software Development
TABLE OF CONTENTS
1. EXECUTIVE SUMMARY ..................................................................................... 1     1.1 Project Abstract ............................................................................................... 1     1.2 Mission Statement ........................................................................................... 1
2. PROBLEM ANALYSIS & RESEARCH .............................................................. 1     2.1 The Latency Gap ............................................................................................. 1     2.2 Fragmentation of Assistive Tools .................................................................... 1
3. ENGINEERING EVOLUTION: THE MODEL PIVOT ...................................... 2     3.1 Initial Prototype: Caffe & MobileNet-SSD ........................................................ 2     3.2 Final Implementation: YOLOv8-Nano ............................................................. 2     3.3 Asynchronous Threading Logic ....................................................................... 2
4. TECHNICAL MODULE SPECIFICATIONS ....................................................... 2     4.1 Vision Assistance & Object Prioritization ........................................................ 2     4.2 Hearing & Neural Translation Engine ............................................................... 3     4.3 Spatial Audio & HRTF Physics ......................................................................... 3
5. ACCESSIBILITY-FIRST UI/UX DESIGN ........................................................ 3     5.1 Fitts’s Law & Interaction Zones ....................................................................... 3     5.2 Multi-Modal Feedback (Narrator Mode) .......................................................... 3
6. QUALITY ASSURANCE & TESTING LOG ...................................................... 4     6.1 Sprint History (Dec 20 – Jan 5) ....................................................................... 4     6.2 Stress Testing & Resolution Data ...................................................................... 4
7. CONCLUSION & FUTURE ROADMAP ............................................................ 5     7.1 Hardware Portability ....................................................................................... 5     7.2 LiDAR and Haptic Integration .......................................................................... 5
8. APPENDICES & SIGNATURES .......................................................................... 5

1. PROJECT ABSTRACT & MISSION STATEMENT
EchoLens is a high-performance, integrated accessibility suite developed to assist individuals navigating the world with visual and auditory impairments. Built during an intensive 16-day development sprint, the system provides a unified "Sensory Hub" that utilizes real-time Computer Vision (CV), Neural Machine Translation (NMT), and Spatial Audio physics.
Our mission was to eliminate the "Latency Gap" found in current assistive tools. In high-stakes environments, a delay of even one second in obstacle detection or language translation can lead to physical danger or social exclusion. EchoLens solves this through aggressive model optimization and an accessibility-first user interface.
2. PROBLEM ANALYSIS & MARKET GAP
During the research phase (Dec 20–22), Sharifa and Saleh identified three critical flaws in the current assistive technology landscape:
Fragmentation: Users are forced to juggle multiple apps (e.g., one for reading signs, one for hearing aids), which causes "context-switching fatigue."
High Computational Latency: Many AI tools rely on heavy cloud processing, which lags significantly on mobile networks.
Interface Exclusion: Standard UI design often utilizes small touch targets and lacks multi-modal feedback (sight/sound/haptics), making them inaccessible to the very users they intend to serve.






3. ENGINEERING EVOLUTION: THE MODEL PIVOT
A defining moment of the development cycle was the rejection of the initial AI framework to ensure a safer, faster user experience.
3.1 The Caffe Framework Prototype (Initial Testing)
From Dec 20 to Dec 23, the team utilized a Caffe-based MobileNet-SSD model sourced from open-source repositories.
Performance Failure: During stress tests, the Caffe model demonstrated significant "Inference Lag," averaging only 5–8 Frames Per Second (FPS). This resulted in "choppy" video that could not keep up with a walking user.
Accuracy Hurdles: The model struggled with "intra-class variation"—for example, it could not reliably distinguish between a small chair and a low-profile table, posing a tripping hazard.
Decision: On Dec 24, we officially deprecated the Caffe framework to prioritize real-time responsiveness.
3.2 The Final Implementation: YOLOv8-Nano
The team pivoted to the Ultralytics YOLOv8-Nano architecture.
Speed Optimization: YOLOv8’s anchor-free detection allowed the system to jump from 8 FPS to over 30 FPS on standard hardware.
Precision: The Nano variant provided a 40% improvement in Mean Average Precision (mAP) for household objects.
Implementation: Saleh and Sharifa engineered a Multi-Threaded Producer-Consumer model. Thread A manages the camera stream while Thread B handles the AI inference, ensuring the UI never "freezes" during detection.





4. TECHNICAL MODULE SPECIFICATIONS
4.1 Vision Assistance & Object Prioritization
The Vision engine is designed to filter environmental "noise."
Confidence Thresholding: Only objects with >0.50 confidence are narrated to prevent "information overload."
Spatial Alert Logic: The system is programmed to identify, prioritizing "Moving Objects" over "Static Objects”.
4.2 Hearing & Neural Translation Engine
This module facilitates seamless multilingual interaction.
BCP-47 Localized Mapping: We created a custom JavaScript dictionary that maps languages (Arabic, Spanish, Japanese, etc.) to their specific regional codes, ensuring the microphone recognizes local dialects accurately.
Neural Translation: Integrated via deep-translator, converting speech into the user's target language in under 300ms.
4.3 Spatial Audio & HRTF Physics
EchoLens uses a 3D soundstage to provide directional awareness.
HRTF (Head-Related Transfer Function): Using the Web Audio API PannerNode, the system simulates how human ears perceive sound in 3D space.
Directional Cues: If an obstacle is on the user's left, the audio warning is panned to the left with simulated "depth," helping the user build a mental map of their room.

5. ACCESSIBILITY-FIRST UI/UX DESIGN
The interface follows a "Glassmorphic Accessibility" style, designed specifically for those with low vision or motor-skill impairments.
Fitts’s Law Implementation: All buttons feature a minimum "hit zone" of 320px. Larger targets reduce the effort required for users with tremors or visual blur.
High-Contrast Palette: We utilized a #70b8ff (Blue) on #000 (Black) scheme, which provides a contrast ratio exceeding WCAG 2.1 AA standards.
The Narrator (Multi-Modal Feedback): Every interactive element is programmed with an onmouseenter trigger. This provides a Text-to-Speech (TTS) voice-over, telling the user what a button does before they click it.
6. QUALITY ASSURANCE & TESTING LOG (SPRINT HISTORY)
This log documents the rigorous "Stress Testing" conducted by Sharifa and Saleh.

Date
Tester
Test Type
Milestone / Hurdle / Resolution
Dec 20
Team
Architecture
Defined the Flask-to-JavaScript bridge.
Dec 22
Saleh
UI Stress
Hurdle: Standard buttons were too small. Fix: Refactored to "Pill" design.
Dec 24
Sharifa
Model Benchmark
Hurdle: Caffe Model lag (8 FPS). Fix: Pivoted to YOLOv8-Nano (35 FPS).
Dec 27
Saleh
Language Sync
Hurdle: Arabic text rendering errors. Fix: Implemented UTF-8 encoding.
Dec 30
Sharifa
Spatial Audio
Hurdle: Audio felt "flat." Fix: Integrated HRTF Panning Model.
Jan 2
Team
Stability Test
Result: System maintained 4-hour uptime with 0% crash rate.
Jan 4
3Sharifa
User Simulation
Result: Confirmed 100% TTS coverage for blind-user navigation.
Jan 5
Team
Final QA
VALIDATED: READY FOR DEMONSTRATION.



7. CONCLUSION & FUTURE ROADMAP
EchoLens serves as a proof-of-concept that high-end AI accessibility does not require expensive, specialized hardware. By optimizing existing models like YOLOv8 and utilizing native Web APIs, Sharifa and Saleh have created a viable solution for daily independence.
7.1 Future Development Goals
Hardware Portability: Transitioning the Flask server to an NVIDIA Jetson Nano for a fully wearable, battery-powered experience.
LiDAR Integration: Adding laser-based distance sensing to provide millimeter-accurate warnings in total darkness.
Haptic Integration: Adding vibration feedback for navigation prompts via Bluetooth-connected wearables.

Certified and Signed by the Development Team:
__________________________ (Sharifa Amrouni)
__________________________ (Saleh Amrouni)
































END OF DOCUMENT
