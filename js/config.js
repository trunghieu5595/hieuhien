/**
 * ============================================
 * 設定ファイル — ここを編集するだけでOK！
 * ============================================
 */

const CONFIG = {
  // 付き合い始めた日（YYYY-MM-DD）
  startDate: '2026-03-06T00:00:00',

  // BGM（MP3ファイルのパス）
  musicSrc: 'images/mylove.mp3',
  musicVolume: 0.65,

  // Scene 1: 二人の写真
  scene1Photos: [
    {
      src: 'images/ngay_dau_tien.jpg',
      alt: 'Ngày đầu tiên',
      caption: 'Ngày đầu tiên...',
    },
    {
      src: 'images/nu_cuoi_em_lam_anh_mat_het_logic.jpg',
      alt: 'Nụ cười em',
      caption: 'Nụ cười em làm anh mất hết logic.',
    },
  ],

  // Scene 3: カルーセル画像
  carouselPhotos: [
    { src: 'images/khoanh_khac_1.jpg', alt: 'Khoảnh khắc 1' },
    { src: 'images/khoanh_khac_2.jpg', alt: 'Khoảnh khắc 2' },
    { src: 'images/khoanh_khac_3.jpg', alt: 'Khoảnh khắc 3' },
    { src: 'images/khoanh_khac_4.jpg', alt: 'Khoảnh khắc 4' },
  ],

  // カルーセル用ランダムキャプション
  carouselCaptions: [
    'Em cười là anh quên luôn deadline.',
    'Nhìn em là thấy bình yên.',
    'Đây là tấm anh thích nhất.',
    'Còn em chắc sẽ chọn tấm khác nhỉ? 😆',
    'Mỗi tấm ảnh đều khiến anh mỉm cười.',
    'Em biết không, anh lưu hết rồi đó.',
  ],

  // タイムライン
  timeline: [
    { icon: '💌', label: 'Lần đầu nói chuyện' },
    { icon: '☕', label: 'Lần đầu gặp nhau' },
    { icon: '🌷', label: 'Lần đầu đi chơi' },
    { icon: '😂', label: 'Những lần cười không ngớt' },
    { icon: '🤍', label: 'Những lúc giận nhau' },
    { icon: '🥹', label: 'Những lần làm lành' },
    { icon: '❤️', label: 'Và hôm nay...' },
  ],

  // 手紙の内容
  letterLines: [
    'Có thể anh không phải người hoàn hảo.',
    'Nhưng từ lúc gặp em...',
    'Anh luôn muốn trở thành phiên bản tốt hơn.',
    'Cảm ơn em vì đã kiên nhẫn.',
    'Cảm ơn em vì đã ở cạnh anh.',
    'Anh mong sau này...',
    'Vẫn được nắm tay em đi qua thật nhiều mùa nữa.',
  ],

  // 願い瓶メッセージ
  wishMessages: [
    'Chúc em ngủ thật ngon.',
    'Mai thức dậy thật nhiều năng lượng.',
    'Mọi điều tốt đẹp sẽ đến với em.',
    'Anh sẽ luôn ở đây.',
    'Em luôn là điều tuyệt vời nhất.',
    'Nhớ mơ thấy anh nha 😌',
    'Hôm nay em đã làm rất tốt rồi.',
    'Anh tự hào về em lắm.',
  ],

  // 「Không」ボタンメッセージ
  noButtonMessages: [
    'Ơ kìa 🥺',
    'Nhấn Có đi mà 😭',
    'Anh buồn đó...',
    'Thiệt luôn hả 😭',
    'Em nghĩ lại đi 🥹',
    'Không được chọn đâu 😤',
    'Anh biết em yêu anh mà 😌',
  ],

  // カラーテーマ（CSS変数と連動）
  colors: {
    pink: '#ffb7c5',
    pinkLight: '#ffd6e0',
    cream: '#fff5f0',
    lavender: '#e8d5f5',
    white: '#ffffff',
    purple: '#c9b1ff',
  },
};
