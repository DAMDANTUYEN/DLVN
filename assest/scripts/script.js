document.addEventListener('DOMContentLoaded', function() {
    const bookContainer = document.getElementById('bookCanvas');
    const onboarding = document.getElementById('onboarding');

    let pageWidth = window.innerWidth * 0.92;
    let pageHeight = pageWidth * 1.45;

    // Giới hạn cho máy tính để không quá to
    if (window.innerWidth > 768) {
        pageWidth = 450;
        pageHeight = 650;
    }

    const pageFlip = new St.PageFlip(bookContainer, {
        width: pageWidth,
        height: pageHeight,
        size: "fixed",
        minWidth: pageWidth,
        maxWidth: pageWidth,
        minHeight: pageHeight,
        maxHeight: pageHeight,
        showCover: true, // Quan trọng để có hiệu ứng lật bìa
        mobileScrollSupport: true,
        flippingTime: 1200, // Tốc độ lật mượt mà
        usePortrait: true, // Chế độ trang đơn cho mobile
        drawShadow: true, // Tạo bóng đổ khi lật
        maxShadowOpacity: 0.5,
        showPageCorners: true, // Hiện góc trang nhô lên gợi ý lật
    });

    // Load các trang từ HTML
    pageFlip.loadFromHTML(document.querySelectorAll(".page"));

    // Tắt Onboarding khi chạm
    const hideOnboarding = () => {
        onboarding.style.opacity = '0';
        setTimeout(() => onboarding.style.display = 'none', 800);
    };

    window.addEventListener('touchstart', hideOnboarding, {once: true});
    window.addEventListener('mousedown', hideOnboarding, {once: true});

    // Đảm bảo lật trang mượt mà bằng cách lắng nghe sự kiện
    pageFlip.on('flip', (e) => {
        console.log('Đang lật sang trang: ' + e.data);
    });
});