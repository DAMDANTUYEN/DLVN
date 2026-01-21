const video = document.getElementById('bg-video');
const audio = document.getElementById('bg-audio');
const onboarding = document.getElementById('onboarding');

/**
* 1. Hàm khởi động trải nghiệm từ màn hình Onboarding
* Giúp lách chính sách chặn âm thanh của trình duyệt
*/
function startExperience() {
    // Phát nhạc và video đồng thời khi người dùng nhấn nút
    audio.play().catch(e => console.log("Âm thanh bị chặn:", e));
    video.play().catch(e => console.log("Video bị chặn:", e));

    // Hiệu ứng mờ dần màn hình chờ
    onboarding.classList.add('fade-out');
    
    // Xóa bỏ hoàn toàn màn hình chờ sau khi hiệu ứng kết thúc
    setTimeout(() => {
        onboarding.style.display = 'none';
    }, 800); 
}

/**
* 2. Xử lý lặp video mượt mà (Seamless Loop)
* Đảm bảo video không bị khựng khi kết thúc vòng lặp
*/
video.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

/**
* 3. Hàm giảm âm lượng và chuyển trang Portal
* Tạo hiệu ứng chuyển cảnh chuyên nghiệp cho "Hành trình tinh hoa"
*/
function goToPortal() {
    const fadeOutDuration = 3000; // Thời gian nhạc nhỏ dần (1.5 giây)
    const intervalTime = 50;      // Tần suất giảm (mỗi 0.05 giây)
    let currentVolume = audio.volume; 
    const step = currentVolume / (fadeOutDuration / intervalTime);

    // Bắt đầu quá trình giảm âm lượng
    const fadeOutInterval = setInterval(() => {
        if (currentVolume > step) {
            currentVolume -= step;
            audio.volume = currentVolume;
        } else {
            // Khi âm lượng về 0, dừng lặp và chuyển trang
            audio.volume = 0;
            clearInterval(fadeOutInterval);
            
            // Chuyển hướng sang trang portal trung gian
            window.location.href = 'page/portal.html'; 
        }
    }, intervalTime);
}