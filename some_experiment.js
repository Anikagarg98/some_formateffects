<!DOCTYPE html>


<html>
<head>
  <title>Experiment</title>

  <script src="https://unpkg.com/jspsych@7.3.4"></script>
  <script src="https://unpkg.com/@jspsych/plugin-html-keyboard-response@1.1.3"></script>
  <script src="https://unpkg.com/@jspsych/plugin-html-button-response@1.2.0"></script>
  <script src="https://unpkg.com/@jspsych/plugin-image-keyboard-response@1.1.3"></script>
  <script src="https://unpkg.com/@jspsych/plugin-survey-html-form@1.0.3"></script>
  <script src="https://unpkg.com/@jspsych/plugin-preload@1.1.3"></script>

  <link href="https://unpkg.com/jspsych@7.3.4/css/jspsych.css" rel="stylesheet" type="text/css" />
  <link href="experiment.css" rel="stylesheet" type="text/css" />
</head>

<script>

  const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
  };

  /* initialize jsPsych */
  var jsPsych = initJsPsych({
    on_trial_start: function(trial){
      trial.data = trial.data || {};
      trial.data.participant_id = participant_id;
      trial.data.condition = condition;
    },
    on_finish: function(){
      // automatically download data as CSV at the end
      let fname = `${participant_id}_SomeFormatV0_${timestamp}.csv`;
      jsPsych.data.get().localSave('csv', fname);
    }
  });
  var timeline = [];

  // variables to hold experimenter inputs
  let participant_id = null;
  let condition = null;
  let trial_image_height = 900 //pixels
  let bookmark_image_height = 850 //pixels
  let post_bookmark_gap = 50 //ms
  let currentdate = new Date().toISOString();
  let timestamp = currentdate.slice(0, 19).replace(/-/g, "-").replace(/:/g, ".").replace("T", "_");
  
  // --------------------------- Stimuli Definitions ----------------------------//
  // Practice Stim Dictionary
  
  practice_stim = { "circle": { "image": "circle-single-purple.png", "audio": "the_circle_is_purple.mp3"},
				   "diamond": { "image": "circle-single-orange.png", "audio": "the_diamond_is_orange.mp3"},
				   "square": { "image": "square-single-brown.png", "audio": "the_square_is_black.mp3"},
				   "star": { "image": "star-single-red.png", "audio": "the_star_is_red.mp3"}
  } 
  
  function latinSquareShuffles(items) {
    // Start with one random shuffle
    const first = jsPsych.randomization.shuffle([...items]);
    const result = [first];
    
    // Each subsequent shuffle is a random rotation of the previous
    for (let i = 1; i < items.length; i++) {
        const rotated = [...result[0].slice(i), ...result[0].slice(0, i)];
        result.push(rotated);
    }
    
    // Shuffle the order of the rows so block order is also randomized
    return jsPsych.randomization.shuffle(result);
  }
  
  const shuffles = latinSquareShuffles(['circle', 'square', 'diamond', 'star']);
  const shapes = shuffles.flat();
  const colors = new Array(4).fill(['pink','green','blue','yellow']).flat()
  //const shapes = Array.from({ length: 4 }, () => shuffle(['circle', 'square', 'diamond', 'star'])).flat();
  
  console.log(colors)
  console.log(shapes)
  
  console.log(shuffle(['circle','square','diamond','star']))
  console.log(shapes[0])
   
  const block_1_structure = [
        {quant:'some', config:'full',color:colors[0], shape:shapes[0]},
        {quant:'some', config:'full',color:colors[1], shape:shapes[1]},
        {quant:'some', config:'full',color:colors[2], shape:shapes[2]},
        {quant:'some', config:'full',color:colors[3], shape:shapes[3]},
        {quant:'some', config:'subset',color:colors[4], shape:shapes[4]},
        {quant:'some', config:'subset',color:colors[5], shape:shapes[5]},
        {quant:'some', config:'subset',color:colors[6], shape:shapes[6]},
        {quant:'some', config:'subset',color:colors[7], shape:shapes[7]}
  ]
 
  const block_2_structure = [
        {quant:'all', config:'full',color:colors[8],shape:shapes[8]},
        {quant:'all', config:'full',color:colors[9],shape:shapes[9]},
        {quant:'all', config:'full',color:colors[10],shape:shapes[10]},
        {quant:'all', config:'full',color:colors[11],shape:shapes[11]},
        {quant:'all', config:'subset',color:colors[12],shape:shapes[12]},
        {quant:'all', config:'subset',color:colors[13],shape:shapes[13]},
        {quant:'all', config:'subset',color:colors[14],shape:shapes[14]},
        {quant:'all', config:'subset',color:colors[15],shape:shapes[15]}
  ]  
  
  function hasLongRun(arr, key, maxRun) {
    let run = 1;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i][key] === arr[i - 1][key]) {
            run++;
            if (run > maxRun) return true;
        } else {
            run = 1;
        }
    }
    return false;
  }
  
  let block_1_shuffled;
  do {
    block_1_shuffled = jsPsych.randomization.shuffle(block_1_structure)
  } while (hasLongRun(block_1_shuffled,'config',2));
  
let block_2_shuffled;
  do {
    block_2_shuffled = jsPsych.randomization.shuffle(block_2_structure)
  } while (hasLongRun(block_2_shuffled,'config',2));
     

  console.log(block_1_shuffled)
  console.log(block_2_shuffled)
 
 
  //--------------------------Helper Functions --------------------------------//

  function trialKeyHandler() {
        let spacePressed = false;
        const startTime = performance.now();
        
        
        // Custom event listener for all key presses
        const keyHandler = function(e) {
            // Press Space to play audio
            if (e.key === ' ') {
                const audio = document.getElementById('trialAudio');
                if (audio) {
                    audio.play();
                    spacePressed = true;
                }
            }
            // Press 1 or 0 to end trial, only after space is pressed
            else if ((e.key === '1' || e.key === '0') && spacePressed) {
                const audio = document.getElementById("trialAudio");
                // Do not progress a trial before the audio has finished playing
                if (audio && !audio.ended) {
                    console.log("not finished")
                    return;
                }
                console.log(audio.ended)
                const rt = performance.now() - startTime;
                
                // Remove event listener
                document.removeEventListener('keydown', keyHandler);
                
                // Manually finish trial with response data
                jsPsych.finishTrial({
                    response: e.key,
                    rt: rt
                });
            }
        };
        // Add the event listener
        document.addEventListener('keydown', keyHandler);
        // Store reference to remove it later if needed
        this.keyHandler = keyHandler;
    }
  function getSessionStimuli(condition) {
    const images = []
    const audio = []
      
    //Practice Stim
    Object.keys(practice_stim).forEach(shape => {
        const stim = practice_stim[shape];
        images.push(`stimuli/images/${stim.image}`);
        audio.push(`stimuli/audio/${stim.audio}`);
    });
    
    //Test Stim block 1
    block_1_shuffled.forEach(function(item,index) {
        const color = item['color'];
        const shape = item['shape'];
        const config = item['config'];
        const quant = item['quant'];
		let audioFile = quant + "_" + shape + "_is_" + color;
		if (condition == 'discrete') {
            audioFile = quant + "_" + shape + "s_are_" + color
        }
		images.push(`stimuli/images/${shape}-${condition}-${config}-${color}.png`);
        audio.push(`stimuli/audio/some${audioFile}.mp3`);
    });
    //Test Stim block 2
	block_2_shuffled.forEach(function(item,index) {
        const color = item['color'];
        const shape = item['shape'];
        const config = item['config'];
        const quant = item['quant'];
		let audioFile = quant + "_" + shape + "_is_" + color;
		if (condition == 'discrete') {
            audioFile = quant + "_" + shape + "s_are_" + color
        }
		images.push(`stimuli/images/${shape}-${condition}-${config}-${color}.png`);
        audio.push(`stimuli/audio/some${audioFile}.mp3`);
    });
    
    console.log(images)
    console.log(audio)      
    return {images,audio}
  }
  
  // ------------ Block Definitions -----------------------//
  // welcome + setup screen
  var welcome_screen = {
    type: jsPsychSurveyHtmlForm,
    preamble: "<h2>Experiment Setup</h2><p>Please enter Participant ID and select a condition.</p>",
    html: `
      <p>
        <label>Participant ID: <input name="participant_id" type="text" required></label>
      </p>
      <p>
        <label>Select Condition:</label><br>
        <input type="radio" name="condition" value="discrete" required> Discrete <br>
        <input type="radio" name="condition" value="continuous" required > Continuous
      </p>
    `,
    button_label: "Start",
    on_finish: function (data) {
      participant_id = data.response["participant_id"];
      condition = data.response["condition"];
    }
  };
  var preload = {
    type: jsPsychPreload,
    images: function() {
        getSessionStimuli(condition).images;
        console.log(getSessionStimuli(condition).images);
    },
    audio: function() {
        getSessionStimuli(condition).audio;
    },
    message: 'Loading experiment materials...',
    show_progress_bar: true,
    continue_after_error: false, // Set to true if you want to continue even if some files fail
    max_load_time: 30000 // 300 seconds timeout
  };
  
  
  var start_screen = {
    type: jsPsychHtmlKeyboardResponse,
    
    stimulus: function() {
        return `<img src="practice.jpg" style="max-height:${bookmark_image_height}px;">`;
    },
    choices: [' '],
    post_trial_gap: post_bookmark_gap
  };
  
  var break_screen = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        return `<img src="break.jpg" style="max-height:${bookmark_image_height}px;">`;
    },
    choices: [' '],
    post_trial_gap: post_bookmark_gap
  };

  var finish_screen = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        return `<img src="finish.jpg" style="max-height:${bookmark_image_height}px;">`;
    },
    choices: [' '],
    post_trial_gap: post_bookmark_gap
  };
  
  var practice_trial = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function () {
          const shape = jsPsych.timelineVariable('shape')
          const stim = practice_stim[shape];
          return `
            <img src="stimuli/images/${stim.image}" style="max-height:${trial_image_height}px; height:auto">
            <audio id="trialAudio" preload="auto">
                <source src="stimuli/audio/${stim.audio}" type="audio/mpeg">
            </audio>
          `;
      },
      data: function (){
        
        const romanNumerals = ['i', 'ii', 'iii', 'iv'];
        const trialN = romanNumerals[jsPsych.timelineVariable('trialN') - 1]
        const shape = jsPsych.timelineVariable('shape');
        const stim = practice_stim[shape];
        
        return {
            type: "practice",
            trialN: trialN,
            shape: shape,
            audio: stim.audio,
            image: stim.image
        };
      },
      choices: "NO_KEYS",
      on_start: trialKeyHandler,
      on_finish: function() {
        // Clean up audio element
        const audio = document.getElementById("trialAudio");
        if (audio) {
            audio.remove();
        }
        
        // Remove event listener if trial ends by other means
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
      },
      
  }

  var test_trial = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function () {
          const color = jsPsych.timelineVariable('color');
          const shape = jsPsych.timelineVariable('shape');
          const config = jsPsych.timelineVariable('config');
          const quant = jsPsych.timelineVariable('quant');
          let audioFile = quant + "_" + shape + "_is_" + color
          if (condition == 'discrete') {
            audioFile = quant + "_" + shape + "s_are_" + color
          }
          console.log(color,audioFile)
          return `
            <img src="stimuli/images/${shape}-${condition}-${config}-${color}.png" style="max-height:${trial_image_height}px;">
            <audio id="trialAudio" preload="auto">
                <source src="stimuli/audio/${audioFile}.mp3" type="audio/mpeg"> //TODO
            </audio>
          `;
      },
      data: function (){
        const trialN  = jsPsych.timelineVariable('trialN');
        const color = jsPsych.timelineVariable('color');
        const shape = jsPsych.timelineVariable('shape');
        const config = jsPsych.timelineVariable('config');
        const quant = jsPsych.timelineVariable('quant');
        
        
        return {
            type: "test",
            trialN: trialN,
            quant: quant,
            config: config,
            color: color,
            shape: shape,
            audio: quant + shape + color + ".mp3",
            image: shape + "-" + condition +  "-" + config +  "-" + color + ".png",
            condition: condition
        };
      },
      choices: "NO_KEYS",
      on_start: trialKeyHandler,
      on_finish: function() {
          const audio = document.getElementById("trialAudio");
          if (audio) {audio.remove()}
      }
  };

  var practice_trials = {
      timeline: [practice_trial],
      timeline_variables: ['circle','square',"star",'diamond'].map((shape,index) => ({ 
        shape: shape,
        trialN: index + 1
      }))
  };
  

  var block_1_trials = {
      timeline: [test_trial],
      timeline_variables: block_1_shuffled.map((trial,index) => ({
      ...trial,
      trialN: index +1
      }))
  };
  console.log(block_1_trials);

  var block_2_trials = {
      timeline: [test_trial],
      timeline_variables: block_2_shuffled
  };
  console.log(block_2_trials);
  
   // ----------------- Run It ------------------------//
  timeline.push(welcome_screen);
  timeline.push(preload);
  timeline.push(start_screen);
  timeline.push(practice_trials);
  timeline.push(block_1_trials);
  timeline.push(break_screen);
  timeline.push(block_2_trials);
  timeline.push(finish_screen);

  // run experiment
  jsPsych.run(timeline);
</script>
</html>