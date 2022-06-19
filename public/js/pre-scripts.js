const searchParams = new URLSearchParams(document.location.search);
const key = (typeof SEQ_APP_URL !== 'undefined') ? false : (searchParams.has('key')) ? searchParams.get('key') : false
let refreshTimer = null;
let notifyCenter

function msToTime(s) {
    // Pad to 2 or 3 digits, default is 2
    function pad(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    }

    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return [pad(hrs), pad(mins), pad(secs)];
}

function startStatusUpdater() {
    clearInterval(refreshTimer);
    refreshTimer = setInterval(getTunersStatus, 60000);
    return false;
}

function getTunersStatus() {
    if (document.getElementById("deviceStatus")) {
        let _url = new URL(`${document.location.origin}/deviceStatus`);
        if (typeof SEQ_APP_URL !== 'undefined')
            _url.pathname = SEQ_APP_URL + _url.pathname;
        if (key)
            _url.searchParams.set('key', key);

        $.ajax({
            async: true,
            url: _url.href,
            type: "GET",
            data: '',
            processData: false,
            contentType: false,
            headers: {},
            success: function (response, textStatus, xhr) {
                $("#deviceStatus").html($(response).children());
            },
            error: function (xhr) {}
        });
    } else {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
    return false;
}
function getPlaylist(page, filter) {
    let playlistFilterOptions = []
    if (document.getElementById("tableContent")) {
        $("#tableContent").removeClass("d-none");
        $("#tabPlaylist").addClass("active");
        $("#tableJobs").addClass("d-none");
        $("#tabJobs").removeClass("active");
        const optionType = document.querySelector("#playlistFilterType > label input:checked")
        const optionFilter = document.querySelector("#setPlaylistFilterChannel > .active")

        let _url = new URL(`${document.location.origin}/eventList`);
        if (typeof SEQ_APP_URL !== 'undefined')
            _url.pathname = SEQ_APP_URL + _url.pathname;
        if (key)
            _url.searchParams.set('key', key);
        if (page)
            _url.searchParams.set('page', page);
        if (optionType)
            _url.searchParams.set('type', optionType.getAttribute('data-typeId'))
        if (filter) {
            _url.searchParams.set('filter', filter)
        } else if (optionFilter) {
            _url.searchParams.set('filter', optionFilter.getAttribute('data-typeId'))
        }
        if (page)
            _url.searchParams.set('page', page)

        if (typeof SEQ_APP_URL !== 'undefined') {
            getNewContent([],[],`${_url.pathname}?${_url.search}`);
        } else {
            $.ajax({
                async: true,
                url: _url.href,
                type: "GET",
                data: '',
                processData: false,
                contentType: false,
                headers: {},
                success: function (response, textStatus, xhr) {
                    $("#tableContent").html($(response).children());
                },
                error: function (xhr) {
                }
            });
        }
    }
    return false;
}
function getJobs(page) {
    if (document.getElementById("tableJobs")) {
        $("#tableContent").addClass("d-none");
        $("#tabPlaylist").removeClass("active");
        $("#tableJobs").removeClass("d-none");
        $("#tabJobs").addClass("active");

        let _url = new URL(`${document.location.origin}/jobList`);
        if (typeof SEQ_APP_URL !== 'undefined')
            _url.pathname = SEQ_APP_URL + _url.pathname;
        if (key)
            _url.searchParams.set('key', key);
        if (page)
            _url.searchParams.set('page', page);

        $.ajax({
            async: true,
            url: _url.href,
            type: "GET",
            data: '',
            processData: false,
            contentType: false,
            headers: {},
            success: function (response, textStatus, xhr) {
                $("#tableJobs").html($(response).children());
            },
            error: function (xhr) {}
        });
    }
    return false;
}

function sendAPIRequest(commandUri) {
    let _url = new URL(`${document.location.origin}/api/${commandUri}`);
    if (typeof SEQ_APP_URL !== 'undefined')
        _url.pathname = SEQ_APP_URL + _url.pathname;
    if (key)
        _url.searchParams.set('key', key);

    $.ajax({
        async: true,
        url: _url.href,
        type: "GET",
        data: '',
        processData: false,
        contentType: false,
        headers: {},
        success: function (response, textStatus, xhr) {
            setTimeout(getTunersStatus, 1000)
            notifyCenter("success", "", "", response);
        },
        error: function (xhr, textStatus) {
            notifyCenter("danger", "", "", xhr.responseText);
        }
    });
    return false;
}

function openTuner(device, digital) {
    let _url = new URL(`${document.location.origin}/channelsList`);
    if (typeof SEQ_APP_URL !== 'undefined')
        _url.pathname = SEQ_APP_URL + _url.pathname;
    if (key)
        _url.searchParams.set('key', key);
    if (device)
        _url.searchParams.set('tuner', device);
    if (digital)
        _url.searchParams.set('digital', digital);

    $.ajax({
        async: true,
        url: _url.href,
        type: "GET",
        data: '',
        processData: false,
        contentType: false,
        headers: {},
        success: function (response, textStatus, xhr) {
            channelsBody.html($(response).children());
            channelsModel.modal('show');
        },
        error: function (xhr) {
            notifyCenter("danger", "Tune", "", `Failed to get channel list`)
        }
    });
    return false;
}
function openZones() {
    let _url = new URL(`${document.location.origin}/zoneList`);
    if (typeof SEQ_APP_URL !== 'undefined')
        _url.pathname = SEQ_APP_URL + _url.pathname;
    if (key)
        _url.searchParams.set('key', key);

    $.ajax({
        async: true,
        url: _url.href,
        type: "GET",
        data: '',
        processData: false,
        contentType: false,
        headers: {},
        success: function (response, textStatus, xhr) {
            zonesBody.html($(response).children());
            zonesModel.modal('show');
        },
        error: function (xhr) {
            notifyCenter("danger", "Tune", "", `Failed to get zone manager`)
        }
    });
    return false;
}

function openRename(filename, ch, guid) {
    if (filename && guid && ch) {
        renameGuid[0].value = guid;
        renameChannel[0].value = ch;
        renameInput[0].value = filename;
        renameModel.modal('show');
    }
    return false;
}
function renameFile() {
    if (renameInput && renameInput[0].value && renameInput[0].value.trim().length > 0) {
        renameModel.modal('hide');
        let _url = new URL(`${document.location.origin}/updateFileName`);
        if (typeof SEQ_APP_URL !== 'undefined')
            _url.pathname = SEQ_APP_URL + _url.pathname;
        if (key)
            _url.searchParams.set('key', key);
        _url.searchParams.set('ch', renameChannel[0].value);
        _url.searchParams.set('guid', renameGuid[0].value);
        _url.searchParams.set('filename', encodeURIComponent(renameInput[0].value.trim()));

        $.ajax({
            async: true,
            url: _url.href,
            type: "GET",
            data: '',
            processData: false,
            contentType: false,
            headers: {},
            success: function (response, textStatus, xhr) {
                notifyCenter("success", "Rename", "", `Updated filename to\n"${renameInput[0].value.trim()}"`)
            },
            error: function (xhr) {
                notifyCenter("danger", "Rename", "", `Failed to update filename`)
            }
        });
    } else {
        notifyCenter("danger", "Rename", "", `Invalid Filename`)
    }
    return false;
}

if (typeof SEQ_APP_URL !== 'undefined') {
    notifyCenter = function (type, title, sub, message) {
        $.toast({
            type: type,
            title: title,
            subtitle: sub,
            content: message,
            delay: 5000,
        });
        return false;
    }
} else {
    notifyCenter = function (type, title, sub, message) {
        const header = $("#centerNotify > .toast-header")
        switch (type) {
            case 'success':
                header.attr("class", "toast-header border-0 bg-success text-white");
                break;
            case 'warning':
                header.attr("class", "toast-header border-0 bg-warning text-white");
                break;
            case 'danger':
                header.attr("class", "toast-header border-0 bg-danger text-white");
                break;
            default:
                header.attr("class", "toast-header border-0 bg-black text-white");
                break;
        }
        $("#centerNotify > .toast-header > strong.mr-auto").text(title);
        $("#centerNotify > .toast-header > small").text(sub);
        $("#centerNotify > .toast-body > span").text(message);
        $("#centerNotify").toast('show');
        return false;
    }
}
