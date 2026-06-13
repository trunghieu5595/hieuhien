/**
 * BGMプレイヤー — MP3ファイルを再生
 */

class BgmPlayer {
  constructor() {
    this.audio = null;
    this.playing = false;
  }

  init() {
    if (this.audio) return;
    this.audio = new Audio(CONFIG.musicSrc);
    this.audio.loop = true;
    this.audio.volume = CONFIG.musicVolume ?? 0.65;
    this.audio.preload = 'auto';
  }

  async start() {
    this.init();
    if (this.playing) return true;
    try {
      await this.audio.play();
      this.playing = true;
      return true;
    } catch (_) {
      return false;
    }
  }

  stop() {
    if (!this.audio) return;
    this.audio.pause();
    this.playing = false;
  }

  async toggle() {
    if (this.playing) {
      this.stop();
      return false;
    }
    return await this.start();
  }
}

window.softMusic = new BgmPlayer();
