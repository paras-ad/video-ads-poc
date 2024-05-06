import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  let videoContent = useRef();
  let playButton;
  let adsManager;
  let adsLoader;
  let adDisplayContainer;
  let isContentFinished;
  let [ isAdPlaying, setAdsPlaying] = useState(false);

  useEffect(() => {
    videoContent = document.getElementById('contentElement');
    playButton = document.getElementById('playButton');
    playButton.addEventListener('click', playAds);
    setUpIMA();
  }, []);

  const playAds = () => {
    videoContent.load();
    adDisplayContainer.initialize();
  
    try {
      adsManager.init(640, 360, window.google.ima.ViewMode.NORMAL);
      adsManager.start();
    } catch (adError) {
      console.log(adError, 'called')
      videoContent.play();
    }
  }

  const setUpIMA = () => {
    adDisplayContainer = new window.google.ima.AdDisplayContainer(document.getElementById('adContainer'), videoContent);
    adsLoader = new window.google.ima.AdsLoader(adDisplayContainer);
    adsLoader.addEventListener(window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, onAdsManagerLoaded, false);
    // adsLoader.addEventListener(window.google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

    const contentEndedListener = function() {
      if (isAdPlaying) return;
      isContentFinished = true;
      adsLoader.contentComplete();
    };
    videoContent.onended = contentEndedListener;

    const adsRequest = new window.google.ima.AdsRequest();
    adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
        'iu=/21775744923/external/single_ad_samples&sz=640x480&' +
        'cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&' +
        'output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=';
    adsRequest.linearAdSlotWidth = 640;
    adsRequest.linearAdSlotHeight = 400;

    adsRequest.nonLinearAdSlotWidth = 640;
    adsRequest.nonLinearAdSlotHeight = 150;

    adsLoader.requestAds(adsRequest);
  }

  const onAdsManagerLoaded = (adsManagerLoadedEvent) => {
    const adsRenderingSettings = new window.google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
    adsManager = adsManagerLoadedEvent.getAdsManager(videoContent, adsRenderingSettings);
    // adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
    adsManager.addEventListener(window.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
    adsManager.addEventListener(window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, onContentResumeRequested);
    adsManager.addEventListener(window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED, onAdEvent);
    adsManager.addEventListener(window.google.ima.AdEvent.Type.LOADED, onAdEvent);
    adsManager.addEventListener(window.google.ima.AdEvent.Type.STARTED, onAdEvent);
    adsManager.addEventListener(window.google.ima.AdEvent.Type.COMPLETE, onAdEvent);
  }

  const onAdEvent = (adEvent) => {
    const ad = adEvent.getAd();
    switch (adEvent.type) {
      case window.google.ima.AdEvent.Type.LOADED:
        if (!ad.isLinear()) {
          videoContent.play();
        }
        break;
      case window.google.ima.AdEvent.Type.COMPLETE:
        break;
    }
  }

  const onContentPauseRequested = () => {
    setAdsPlaying(true);
    videoContent.pause();
  }
  
  const onContentResumeRequested = () => {
    setAdsPlaying(false);
    if (!isContentFinished) {
      videoContent.play();
    }
  }

  return (
    <div className="App">
      <div>
        <div id="mainContainer">
          <div id="content">
            <video id="contentElement">
              <source src="http://media.w3.org/2010/05/sintel/trailer.mp4"></source>
            </video>
            <div id="adContainer"></div>
          </div>
        </div>
      </div>
      <button id="playButton">Play Ad</button>
    </div>
  );
}

export default App;
