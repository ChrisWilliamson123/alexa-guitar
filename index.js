const Alexa = require("ask-sdk");

const audioEvents = [
  "AudioPlayer.PlaybackStopped",
  "AudioPlayer.PlaybackStarted",
  "AudioPlayer.PlaybackFinished",
  "AudioPlayer.PlaybackNearlyFinished",
  "AudioPlayer.PlaybackFailed"
]

const audioEventHandler = {
  canHandle({ requestEnvelope: { request } }) {
    return audioEvents.indexOf(request.type) > -1;
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  }
}

const MetronomeIntentHandler = {
  canHandle({ requestEnvelope: { request } }) {
    return request.type === "IntentRequest" && request.intent.name === "MetronomeIntent";
  },
  handle(handlerInput) {
    const bpm = handlerInput.requestEnvelope.request.intent.slots.bpm.value;
    return handlerInput.responseBuilder
      .speak(`Starting metronome at ${bpm} BPM`)
      .addAudioPlayerPlayDirective('REPLACE_ALL', `https://s3.eu-west-2.amazonaws.com/beat-files/${bpm}-4_4.mp3`, 'abc', 0, undefined)
      .getResponse();
  }
};

const LaunchRequestHandler = {
  canHandle({ requestEnvelope: { request } }) {
    return request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Welcome to Guitar for Alexa. You can ask for a metronome at a BPM between 30 and 250.")
      .reprompt("You can ask for a metronome at a BPM between 30 and 250.")
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle({ requestEnvelope: { request } }) {
    return request.type === "IntentRequest" && request.intent.name === "AMAZON.HelpIntent";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("You can ask for a metronome at a BPM between 30 and 250. For example. Start a metronome at 80 beats per minute.")
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle({ requestEnvelope: { request } }) {
    return (
      request.type === "IntentRequest" &&
      (request.intent.name === "AMAZON.CancelIntent" || request.intent.name === "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speechText = "Goodbye!";
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  }
};

const PauseIntentHandler = {
  canHandle({ requestEnvelope: { request } }) {
    return (
      request.type === "IntentRequest" && request.intent.name === 'AMAZON.PauseIntent'
    )
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse();
  }
}

const ResumeIntentHandler = {
  canHandle({ requestEnvelope: { request } }) {
    return (
      request.type === "IntentRequest" && request.intent.name === 'AMAZON.ResumeIntent'
    )
  },
  handle(handlerInput) {
    const offset = handlerInput.requestEnvelope.context.AudioPlayer.offsetInMilliseconds;
    return handlerInput.responseBuilder
      .addAudioPlayerPlayDirective('REPLACE_ALL', 'https://s3.eu-west-2.amazonaws.com/beat-files/110-4_4.mp3', 'abc', offset, undefined)
      .getResponse()
  }
}

let skill;

async function mainHandler(event, context) {
  console.log(`REQUEST:\n${JSON.stringify(event, null, 2)}`);
  
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        MetronomeIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        audioEventHandler,
        PauseIntentHandler,
        ResumeIntentHandler
      )
      .create();
  }

  return skill.invoke(event, context);
}

exports.handler = mainHandler;
