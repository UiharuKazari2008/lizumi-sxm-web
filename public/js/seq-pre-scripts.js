function startStatusUpdater() {
    getTunersStatus();
    setInterval(getTunersStatus, 10000);
    return false;
}

function getTunersStatus() {
    if (document.getElementById("deviceStatus")) {
        $.ajax({
            async: true,
            url: `${SEQ_APP_URL}/deviceStatus`,
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
    let playlistFilterOptions = []
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
    getNewContent([],[],`${SEQ_APP_URL}/eventList?${playlistFilterOptions.join('&')}`);
    return false;
}
function getJobs(page) {
    $("#tableContent").addClass("d-none");
    $("#tabPlaylist").removeClass("active");
    $("#tableJobs").removeClass("d-none");
    $("#tabJobs").addClass("active");

    if (document.getElementById("tableJobs")) {
        let playlistFilterOptions = []
        if (page)
            playlistFilterOptions.push(`page=${page}`)
        $.ajax({
            async: true,
            url: `${SEQ_APP_URL}/jobList?${playlistFilterOptions.join('&')}`,
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

function sendAPIRequest(commandUri) {
    $.ajax({
        async: true,
        url: `${SEQ_APP_URL}/api/${commandUri}`,
        type: "GET",
        data: '',
        processData: false,
        contentType: false,
        headers: {},
        success: function (response, textStatus, xhr) {
            setTimeout(getTunersStatus, 1000)
            notifyCenter("success", "", "", xhr.responseText);
        },
        error: function (xhr, textStatus) {
            notifyCenter("danger", "", "", xhr.responseText);
        }
    });
    return false;
}
