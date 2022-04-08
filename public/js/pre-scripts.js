const searchParams = new URLSearchParams(document.location.search);
const key = (searchParams.get('key')) ? 'key=' + searchParams.get('key') : ''

function startStatusUpdater() {
    getTunersStatus();
    setInterval(getTunersStatus, 10000);
    return false;
}

function getTunersStatus() {
    if (document.getElementById("deviceStatus")) {
        $.ajax({
            async: true,
            url: `/deviceStatus?${key}`,
            type: "GET",
            data: '',
            processData: false,
            contentType: false,
            headers: {},
            success: function (response, textStatus, xhr) {
                $("#deviceStatus").html($(response).children());
            },
            error: function (xhr) {
                //$("#deviceStatus").html(`<h3>Failed to get status</h3>`);
            }
        });
    }
    return false;
}

function getPlaylist(page, filter) {
    $("#tableContent").removeClass("d-none");
    $("#tabPlaylist").addClass("active");
    $("#tableJobs").addClass("d-none");
    $("#tabJobs").removeClass("active");
    let playlistFilterOptions = []
    if (document.getElementById("tableContent")) {
        if (key.length > 0)
            playlistFilterOptions.push(key)
        const optionType = document.querySelector("#playlistFilterType > label input:checked")
        const optionFilter = document.querySelector("#setPlaylistFilterChannel > .active")
        if (optionType)
            playlistFilterOptions.push(`type=${optionType.getAttribute('data-typeId')}`)
        if (filter) {
            playlistFilterOptions.push(`filter=${filter}`)
        } else if (optionFilter) {
            playlistFilterOptions.push(`filter=${optionFilter.getAttribute('data-typeId')}`)
        }
        if (page)
            playlistFilterOptions.push(`page=${page}`)
        $.ajax({
            async: true,
            url: `/eventList?${playlistFilterOptions.join('&')}`,
            type: "GET",
            data: '',
            processData: false,
            contentType: false,
            headers: {},
            success: function (response, textStatus, xhr) {
                $("#tableContent").html($(response).children());
            },
            error: function (xhr) {
                //$("#tableContent").html(`<h3>Failed to get playlist</h3>`);
            }
        });
    }
    return false;
}
function getJobs(page) {
    $("#tableContent").addClass("d-none");
    $("#tabPlaylist").removeClass("active");
    $("#tableJobs").removeClass("d-none");
    $("#tabJobs").addClass("active");

    if (document.getElementById("tableJobs")) {
        let playlistFilterOptions = []
        if (key.length > 0)
            playlistFilterOptions.push(key)
        if (page)
            playlistFilterOptions.push(`page=${page}`)
        $.ajax({
            async: true,
            url: `/jobList?${playlistFilterOptions.join('&')}`,
            type: "GET",
            data: '',
            processData: false,
            contentType: false,
            headers: {},
            success: function (response, textStatus, xhr) {
                $("#tableJobs").html($(response).children());
            },
            error: function (xhr) {
                //$("#tableJobs").html(`<h3>Failed to get jobs</h3>`);
            }
        });
    }
    return false;
}

function setSource(tunerId) {
    if (document.getElementById("deviceStatus")) {
        $.ajax({
            async: true,
            url: `/setSource/${tunerId}?${key}`,
            type: "GET",
            data: '',
            processData: false,
            contentType: false,
            headers: {},
            success: function (response, textStatus, xhr) {
                setTimeout(getTunersStatus, 1000)
                //notifyCenter("success", "Player", "", response)
            },
            error: function (xhr) {
                notifyCenter("danger", "Source", "", `Failed to change the audio source to "${tunerId}"`)
            }
        });
    }
    return false;
}

function deTuneTuner(tunerId) {
    if (document.getElementById("deviceStatus")) {
        $.ajax({
            async: true,
            url: `/deTuneTuner/${tunerId}?${key}`,
            type: "GET",
            data: '',
            processData: false,
            contentType: false,
            headers: {},
            success: function (response, textStatus, xhr) {
                setTimeout(getTunersStatus, 1000)
                notifyCenter("success", "Tuner", "", response)
            },
            error: function (xhr) {
                notifyCenter("danger", "Tuner", "", `Failed to detune the tuner "${tunerId}"`)
            }
        });
    }
    return false;
}
function recordThisTuner(tunerId) {
    if (document.getElementById("deviceStatus")) {
        $.ajax({
            async: true,
            url: `/pendRequestTuner/${tunerId}?${key}`,
            type: "GET",
            data: '',
            processData: false,
            contentType: false,
            headers: {},
            success: function (response, textStatus, xhr) {
                notifyCenter("success", "Record", "", "Event has been scheduled for recording!")
            },
            error: function (xhr) {
                notifyCenter("danger", "Record", "", `Failed to schedule event for "${tunerId}"`)
            }
        });
    }
    return false;
}
function recordThisGUID(guid) {
    if (document.getElementById("deviceStatus")) {
        $.ajax({
            async: true,
            url: `/pendRequestGuid/${guid}?${key}`,
            type: "GET",
            data: '',
            processData: false,
            contentType: false,
            headers: {},
            success: function (response, textStatus, xhr) {
                notifyCenter("success", "Record", "", "Event has been scheduled for recording!")
            },
            error: function (xhr) {
                notifyCenter("danger", "Record", "", `Failed to schedule event\n${guid}`)
            }
        });
    }
    return false;
}
function cancelJob(guid) {
    if (document.getElementById("deviceStatus")) {
        $.ajax({
            async: true,
            url: `/cancelJob/${guid}?${key}`,
            type: "GET",
            data: '',
            processData: false,
            contentType: false,
            headers: {},
            success: function (response, textStatus, xhr) {
                notifyCenter("success", "Job Manager", "", response)
            },
            error: function (xhr) {
                notifyCenter("danger", "Job Manager", "", `Failed to cancel job\n${guid}`)
            }
        });
    }
    return false;
}
