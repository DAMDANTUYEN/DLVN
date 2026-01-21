$(document).ready(function() {
var flipbook = $("#flipbook");

flipbook.turn({
    width: $('#flipbook-container').width(),
    height: $('#flipbook-container').height(),
    autoCenter: true,
    display: 'single',
    acceleration: true,
    elevation: 100,
    duration: 1000,
    gradients: true,
    when: {
        turning: function() { $('#swipe-guide').fadeOut(500); },
        turned: function(e, page) {
            $('#current-page').text(page);
            // Cập nhật trạng thái nút mũi tên
            if (page == 1) $('.prev-arrow').addClass('disabled'); else $('.prev-arrow').removeClass('disabled');
            if (page == 16) $('.next-arrow').addClass('disabled'); else $('.next-arrow').removeClass('disabled');
        }
    }
});

// Tự động điều chỉnh kích thước khi xoay màn hình
$(window).resize(function() {
    flipbook.turn('size', $('#flipbook-container').width(), $('#flipbook-container').height());
});
});