function autoSrcollTop(selector) {
    setTimeout(() => {
        const e = document.querySelector(selector);
        e.scrollTop = e.scrollHeight * 3;
    }, 50);
}

function getTime() {
    var d = new Date();
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000); // UTC time
    var offset = 7; // UTC +7 hours
    var gmt7 = new Date(utc + (3600000 * (offset - d.getTimezoneOffset() / 60)));
    return gmt7;
}

function formatTime(time) {
    let str = time;
    if (typeof time === "string") {
        str = new Date(time);
    }
    str = str.toLocaleString('vi-VN', { timeZone: 'UTC' }).split(" ");
    return str[0].substr(0, str[0].lastIndexOf(":")) + " " + str[1];
}

function disableElements(selectors, eDisabled) {
    selectors.forEach(selector => {
        document.querySelector(selector).disabled = eDisabled;
    })
}

function removeAccents(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
}
function compareFn(a, b) {
    if (a.lastMessageDate > b.lastMessageDate) return -1;
    else if (a.lastMessageDate < b.lastMessageDate) return 1;
    else return 0;
}

function openUploadModal(component, callback) {
    const widget = window.cloudinary.createUploadWidget(
        {
            cloud_name: 'dwnunieno',
            upload_preset: 'ma9pfovj',
            maxImageFileSize: 10000000,
            autoMinimize: true,
            sources: ["local"],
            clientAllowedFormats: ["image"],
            maxFiles: (component === 'Content') ? 5 : 1
        },
        async (error, result) => {
            if (!error && result && result.event === "success") {
                // console.log('Done uploading..: ', result.info);
                if (typeof callback === 'function') {
                    callback({
                        "url": result.info.url,
                        "nameFileAvatar": result.info.original_filename + "." + result.info.format
                    });
                }
                await widget.destroy({ removeThumbnails: true })
                    .then(() => {
                        console.log("Widget was destroyed");
                    });
            }
        }).open();
}

module.exports = {
    autoSrcollTop,
    getTime,
    formatTime,
    disableElements,
    removeAccents,
    compareFn,
    openUploadModal
}