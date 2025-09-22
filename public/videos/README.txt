Copy your sample videos into this folder and name them as follows (PowerShell commands):

n# from PowerShell (run in an elevated prompt if necessary)
# Adjust source path if needed; the commands below assume the files exist at:
# E:\Websites\Adons\Sample videos\

nCopy-Item -Path "E:\Websites\Adons\Sample videos\Firefly An ancient temple in the heart of a glowing jungle, fireflies and mist, magical ambiance, ci.mp4" -Destination "E:\Websites\Adons\Frontend\public\videos\firefly-temple.mp4"
Copy-Item -Path "E:\Websites\Adons\Sample videos\Firefly Futuristic electric SUV driving through a neon-lit smart city, rain reflections, night scene.mp4" -Destination "E:\Websites\Adons\Frontend\public\videos\firefly-suv.mp4"
Copy-Item -Path "E:\Websites\Adons\Sample videos\Firefly Girl standing in golden hour breeze on a cliff, hair flowing, cinematic lens flare, dreamy l.mp4" -Destination "E:\Websites\Adons\Frontend\public\videos\firefly-girl.mp4"
Copy-Item -Path "E:\Websites\Adons\Sample videos\Firefly Holographic interface being controlled by human hands, futuristic UI-UX, transparent screens.mp4" -Destination "E:\Websites\Adons\Frontend\public\videos\firefly-holo.mp4"
Copy-Item -Path "E:\Websites\Adons\Sample videos\Firefly-give_an_uplifting_futuristic_vibe_music.mp4" -Destination "E:\Websites\Adons\Frontend\public\videos\firefly-music.mp4"

# After copying, start dev server from Frontend folder:
# cd "E:\Websites\Adons\Frontend"
# npm run dev
