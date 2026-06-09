#!/bin/bash
export PATH="$HOME/.local/bin:$PATH"
FONT="/tmp/Montserrat-Bold.ttf"
MONO="/tmp/JetBrainsMono-Bold.ttf"
W=1920 H=1080
BG="0a0a0a" OR="FF8800" GR="00FF41" CY="06B6D4" WH="e5e2e1" MU="888888"
TMP=/tmp/aimodelranks-frames
mkdir -p "$TMP"

echo "=== Segment 1: Title (0-3s) ==="
ffmpeg -y -f lavfi -i "color=c=#${BG}:s=${W}x${H}:d=3:r=30" \
  -filter_complex "
    drawtext=fontfile=${FONT}:text='AI Model Ranks':fontsize=96:fontcolor=#${OR}:x=(w-text_w)/2:y=(h-text_h)/2-50:alpha='if(lt(t,0.5),t/0.5,if(lt(t,2.5),1,(3-t)/0.5))',
    drawtext=fontfile=${MONO}:text='THE BLOOMBERG TERMINAL FOR AI':fontsize=24:fontcolor=#${MU}:x=(w-text_w)/2:y=(h-text_h)/2+60:alpha='if(lt(t,0.9),(t-0.4)/0.5,if(lt(t,2.5),1,(3-t)/0.5))'
  " -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -an "$TMP/s1.mp4" 2>&1 | tail -2

echo "=== Segment 2: Stats (3-6s) ==="
ffmpeg -y -f lavfi -i "color=c=#${BG}:s=${W}x${H}:d=3:r=30" \
  -filter_complex "
    drawtext=fontfile=${MONO}:text='200+':fontsize=120:fontcolor=#${OR}:x=(w-text_w)/2-220:y=(h-text_h)/2-20:alpha='if(lt(t,0.3),t/0.3,1)',
    drawtext=fontfile=${FONT}:text='Models Tracked':fontsize=22:fontcolor=#${MU}:x=(w-text_w)/2-220:y=(h-text_h)/2+100:alpha='if(lt(t,0.3),t/0.3,1)',
    drawtext=fontfile=${MONO}:text='\$0.15':fontsize=120:fontcolor=#${GR}:x=(w-text_w)/2+220:y=(h-text_h)/2-20:alpha='if(lt(t,0.6),(t-0.3)/0.5,1)',
    drawtext=fontfile=${FONT}:text='Avg / 1M Tokens':fontsize=22:fontcolor=#${MU}:x=(w-text_w)/2+220:y=(h-text_h)/2+100:alpha='if(lt(t,0.6),(t-0.3)/0.5,1)'
  " -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -an "$TMP/s2.mp4" 2>&1 | tail -2

echo "=== Segment 3: Value Props (6-10s) ==="
ffmpeg -y -f lavfi -i "color=c=#${BG}:s=${W}x${H}:d=4:r=30" \
  -filter_complex "
    drawtext=fontfile=${FONT}:text='Compare Every LLM — In One Place':fontsize=40:fontcolor=#${WH}:x=200:y=200:alpha='if(lt(t,0.3),t/0.3,1)',
    drawtext=fontfile=${FONT}:text='Find the Cheapest API Instantly':fontsize=40:fontcolor=#${WH}:x=200:y=320:alpha='if(lt(t,0.8),(t-0.5)/0.5,1)',
    drawtext=fontfile=${FONT}:text='Track Real-Time Pricing Updates':fontsize=40:fontcolor=#${WH}:x=200:y=440:alpha='if(lt(t,1.3),(t-0.9)/0.5,1)',
    drawtext=fontfile=${FONT}:text='Stop Overpaying for AI Infrastructure':fontsize=40:fontcolor=#${OR}:x=200:y=560:alpha='if(lt(t,1.8),(t-1.4)/0.5,1)'
  " -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -an "$TMP/s3.mp4" 2>&1 | tail -2

echo "=== Segment 4: Numbers Grid (10-14s) ==="
ffmpeg -y -f lavfi -i "color=c=#${BG}:s=${W}x${H}:d=4:r=30" \
  -filter_complex "
    drawtext=fontfile=${MONO}:text='196':fontsize=56:fontcolor=#${OR}:x=200:y=320:alpha='if(lt(t,0.3),t/0.3,1)',
    drawtext=fontfile=${FONT}:text='Total Models':fontsize=16:fontcolor=#${MU}:x=200:y=390:alpha='if(lt(t,0.3),t/0.3,1)',
    drawtext=fontfile=${MONO}:text='\$0.15':fontsize=56:fontcolor=#${GR}:x=640:y=320:alpha='if(lt(t,0.5),(t-0.3)/0.5,1)',
    drawtext=fontfile=${FONT}:text='Avg Cost /1M':fontsize=16:fontcolor=#${MU}:x=640:y=390:alpha='if(lt(t,0.5),(t-0.3)/0.5,1)',
    drawtext=fontfile=${MONO}:text='4':fontsize=56:fontcolor=#${CY}:x=1080:y=320:alpha='if(lt(t,0.8),(t-0.5)/0.5,1)',
    drawtext=fontfile=${FONT}:text='Benchmarks':fontsize=16:fontcolor=#${MU}:x=1080:y=390:alpha='if(lt(t,0.8),(t-0.5)/0.5,1)',
    drawtext=fontfile=${MONO}:text='∞':fontsize=56:fontcolor=#${WH}:x=1520:y=320:alpha='if(lt(t,1.0),(t-0.7)/0.5,1)',
    drawtext=fontfile=${FONT}:text='Live Updates':fontsize=16:fontcolor=#${MU}:x=1520:y=390:alpha='if(lt(t,1.0),(t-0.7)/0.5,1)'
  " -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -an "$TMP/s4.mp4" 2>&1 | tail -2

echo "=== Segment 5: Features (14-18s) ==="
ffmpeg -y -f lavfi -i "color=c=#${BG}:s=${W}x${H}:d=4:r=30" \
  -filter_complex "
    drawtext=fontfile=${FONT}:text='Real-Time Pricing':fontsize=26:fontcolor=#${OR}:x=180:y=240:alpha='if(lt(t,0.3),t/0.3,1)',
    drawtext=fontfile=${FONT}:text='Input & output costs across 200+ models':fontsize=16:fontcolor=#${MU}:x=180:y=280:alpha='if(lt(t,0.3),t/0.3,1)',
    drawtext=fontfile=${FONT}:text='Benchmark Scores':fontsize=26:fontcolor=#${OR}:x=720:y=240:alpha='if(lt(t,0.6),(t-0.3)/0.5,1)',
    drawtext=fontfile=${FONT}:text='MMLU, HumanEval, GPQA & Arena Elo':fontsize=16:fontcolor=#${MU}:x=720:y=280:alpha='if(lt(t,0.6),(t-0.3)/0.5,1)',
    drawtext=fontfile=${FONT}:text='API Access':fontsize=26:fontcolor=#${OR}:x=1260:y=240:alpha='if(lt(t,0.9),(t-0.6)/0.5,1)',
    drawtext=fontfile=${FONT}:text='Integrate live pricing via RapidAPI':fontsize=16:fontcolor=#${MU}:x=1260:y=280:alpha='if(lt(t,0.9),(t-0.6)/0.5,1)',
    drawtext=fontfile=${FONT}:text='7-Day Trends':fontsize=26:fontcolor=#${OR}:x=180:y=460:alpha='if(lt(t,1.2),(t-0.9)/0.5,1)',
    drawtext=fontfile=${FONT}:text='Track price changes across every model':fontsize=16:fontcolor=#${MU}:x=180:y=500:alpha='if(lt(t,1.2),(t-0.9)/0.5,1)',
    drawtext=fontfile=${FONT}:text='Live Terminal':fontsize=26:fontcolor=#${OR}:x=720:y=460:alpha='if(lt(t,1.5),(t-1.2)/0.5,1)',
    drawtext=fontfile=${FONT}:text='Search, filter, sort 196 models instantly':fontsize=16:fontcolor=#${MU}:x=720:y=500:alpha='if(lt(t,1.5),(t-1.2)/0.5,1)'
  " -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -an "$TMP/s5.mp4" 2>&1 | tail -2

echo "=== Segment 6: CTA (18-21s) ==="
ffmpeg -y -f lavfi -i "color=c=#${BG}:s=${W}x${H}:d=3:r=30" \
  -filter_complex "
    drawtext=fontfile=${MONO}:text='aimodelranks.live':fontsize=72:fontcolor=#${OR}:x=(w-text_w)/2:y=(h-text_h)/2-60:alpha='if(lt(t,0.5),t/0.5,1)',
    drawtext=fontfile=${FONT}:text='Stop guessing. Start comparing.':fontsize=32:fontcolor=#${MU}:x=(w-text_w)/2:y=(h-text_h)/2+40:alpha='if(lt(t,1.0),(t-0.5)/0.5,1)',
    drawtext=fontfile=${FONT}:text='Visit Now':fontsize=24:fontcolor=#${BG}:box=1:boxcolor=#${OR}:boxborderw=14:x=(w-text_w)/2:y=(h-text_h)/2+140:alpha='if(lt(t,1.5),(t-1.0)/0.5,1)'
  " -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -an "$TMP/s6.mp4" 2>&1 | tail -2

echo "=== Done segments ==="
ls -la "$TMP/"*.mp4 2>/dev/null
for f in "$TMP"/s*.mp4; do
  if [ -f "$f" ]; then
    size=$(stat -c%s "$f" 2>/dev/null || echo 0)
    echo "$f: $size bytes"
  fi
done
