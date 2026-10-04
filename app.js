import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


// =========================================
// SUPABASE CONNECTION
// =========================================

const SUPABASE_URL = "https://nwbhjpppqxyevmzveppr.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_k36f-UYrGsrsM02OBpRQzg_hlgiiuZj";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

window.supabase = supabase;


// =========================================
// ELEMENTS
// =========================================

const gallery = document.getElementById("gallery");

const addButton = document.getElementById("add-button");

const manageButton = document.getElementById("manage-button");

const doneButton =
    document.getElementById("done-button");

const loginModal = document.getElementById("login-modal");

const loginClose = document.getElementById("login-close");

const loginForm = document.getElementById("login-form");

const loginEmail = document.getElementById("login-email");

const loginPassword = document.getElementById("login-password");

const loginError = document.getElementById("login-error");

const loginSubmit = document.getElementById("login-submit");

// =========================================
// ADD FAVORITE ELEMENTS
// =========================================

const addModal =
    document.getElementById("add-modal");

const addClose =
    document.getElementById("add-close");

const addCancel =
    document.getElementById("add-cancel");

const addForm =
    document.getElementById("add-form");

const favoriteName =
    document.getElementById("favorite-name");

const favoriteImageUrl =
    document.getElementById("favorite-image-url");

const imagePreview =
    document.getElementById("image-preview");

const previewImage =
    document.getElementById("preview-image");

const addError =
    document.getElementById("add-error");

const addSubmit =
    document.getElementById("add-submit");
// =========================================
// VIDEO VAULT ELEMENTS
// =========================================

const videoModal = document.getElementById("video-modal");
const videoClose = document.getElementById("video-close");
const videoTitle = document.getElementById("video-title");
const videoSubtitle = document.getElementById("video-subtitle");
const videoList = document.getElementById("video-list");

const videoAddButton =
    document.getElementById("video-add-button");

const addVideoModal =
    document.getElementById("add-video-modal");

const addVideoClose =
    document.getElementById("add-video-close");

const addVideoCancel =
    document.getElementById("add-video-cancel");

const addVideoForm =
    document.getElementById("add-video-form");

const videoUrlInput =
    document.getElementById("video-url");

let currentVideoFavorite = null;

// =========================================
// AUTH STATE
// =========================================

let currentUser = null;
// =========================================
// VIDEO VAULT
// =========================================

async function openVideoVault(favorite) {

    currentVideoFavorite =
        favorite;

    videoTitle.textContent =
        favorite.name;

    videoSubtitle.textContent =
        "Videos";

    if (manageMode) {

        videoAddButton.classList.remove(
            "hidden"
        );

    } else {

        videoAddButton.classList.add(
            "hidden"
        );

    }

    videoList.innerHTML = `
        <div class="video-empty">
            Loading videos...
        </div>
    `;

    videoModal.classList.remove(
        "hidden"
    );


    const {
        data,
        error
    } = await supabase
        .from("favorite_videos")
        .select(
            "id, video_url, title, thumbnail_url, domain"
        )
        .eq(
            "favorite_id",
            favorite.id
        )
        .order(
            "id",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Could not load videos:",
            error
        );

        videoList.innerHTML = `
            <div class="video-empty">
                Unable to load videos.
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        videoList.innerHTML = `
            <div class="video-empty">
                No videos added yet.
            </div>
        `;

        return;
    }


    videoList.innerHTML = "";


    data.forEach((video) => {

        const item =
            document.createElement("div");

        item.className =
            "video-item";


        const link =
            document.createElement("a");

        link.href =
            video.video_url;

        link.target =
            "_blank";

        link.rel =
            "noopener noreferrer";

        link.className =
            "video-item-link";


        if (video.thumbnail_url) {

            const thumbnail =
                document.createElement("img");

            thumbnail.className =
                "video-item-thumbnail";

            thumbnail.src =
                video.thumbnail_url;

            thumbnail.alt =
                video.title ||
                "Video thumbnail";

            thumbnail.loading =
                "lazy";

            thumbnail.addEventListener(
                "error",
                () => {
                    thumbnail.remove();
                }
            );

            link.appendChild(
                thumbnail
            );
        }


        const info =
            document.createElement("div");

        info.className =
            "video-item-info";


        const title =
            document.createElement("p");

        title.className =
            "video-item-title";

        title.textContent =
            video.title ||
            video.domain ||
            "Open video";


        const url =
            document.createElement("p");

        url.className =
            "video-item-url";

        url.textContent =
            video.domain ||
            video.video_url;


        info.appendChild(
            title
        );

        info.appendChild(
            url
        );

        link.appendChild(
            info
        );

        item.appendChild(
            link
        );


        // =====================================
        // MANAGEMENT BUTTONS
        // =====================================

        if (manageMode) {

            const actions =
                document.createElement("div");

            actions.className =
                "video-item-actions";


            const editButton =
                document.createElement("button");

            editButton.type =
                "button";

            editButton.className =
                "video-edit-button";

            editButton.textContent =
                "Edit";


            editButton.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    event.stopPropagation();

                    openEditVideo(
                        video
                    );

                }
            );


            const deleteButton =
                document.createElement("button");

            deleteButton.type =
                "button";

            deleteButton.className =
                "video-delete-button";

            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                async (event) => {

                    event.preventDefault();

                    event.stopPropagation();

                    await deleteVideo(
                        video
                    );

                }
            );


            actions.appendChild(
                editButton
            );

            actions.appendChild(
                deleteButton
            );

            item.appendChild(
                actions
            );
        }


        videoList.appendChild(
            item
        );

    });
}

// =========================================
// DELETE VIDEO
// =========================================

async function deleteVideo(video) {

    const confirmed =
        window.confirm(
            "Delete this video?"
        );

    if (!confirmed) {

        return;
    }


    const {
        error
    } = await supabase
        .from("favorite_videos")
        .delete()
        .eq(
            "id",
            video.id
        );


    if (error) {

        console.error(
            "Could not delete video:",
            error
        );

        alert(
            "Could not delete video."
        );

        return;
    }


    await openVideoVault(
        currentVideoFavorite
    );

    await loadFavorites();
}
// =========================================
// EDIT VIDEO
// =========================================

async function openEditVideo(video) {

    const newUrl =
        window.prompt(
            "Enter the new video URL:",
            video.video_url
        );

    if (newUrl === null) {

        return;
    }

    const videoUrl =
        newUrl.trim();

    if (!videoUrl) {

        alert(
            "Video URL cannot be empty."
        );

        return;
    }


    // =====================================
    // EXTRACT NEW METADATA
    // =====================================

    const {
        data: metadata,
        error: metadataError
    } = await supabase.functions.invoke(
        "bright-responder",
        {
            body: {
                url: videoUrl
            }
        }
    );


    if (metadataError) {

        console.error(
            "Could not extract video metadata:",
            metadataError
        );

        alert(
            "Could not extract metadata. The video URL will still be updated."
        );
    }


    // =====================================
    // UPDATE VIDEO
    // =====================================

    const {
        error
    } = await supabase
        .from("favorite_videos")
        .update({
            video_url:
                videoUrl,

            title:
                metadata?.title || null,

            thumbnail_url:
                metadata?.thumbnail_url
                    ? metadata.thumbnail_url.replace(
                        /&amp;/g,
                        "&"
                    )
                    : null,

            domain:
                metadata?.domain || null
        })
        .eq(
            "id",
            video.id
        );


    if (error) {

        console.error(
            "Could not update video:",
            error
        );

        alert(
            "Could not update video."
        );

        return;
    }


    await openVideoVault(
        currentVideoFavorite
    );

    await loadFavorites();
}

// =========================================
// ADD VIDEO
// =========================================

async function addVideo() {

    if (!currentVideoFavorite) {

        return;
    }

    const videoUrl =
        videoUrlInput.value.trim();

    if (!videoUrl) {

        return;
    }


    // =========================================
    // EXTRACT VIDEO METADATA
    // =========================================

    const {
        data: metadata,
        error: metadataError
    } = await supabase.functions.invoke(
        "bright-responder",
        {
            body: {
                url: videoUrl
            }
        }
    );


    if (metadataError) {

        console.error(
            "Could not extract video metadata:",
            metadataError
        );

        alert(
            "Could not extract video metadata. The video URL will still be saved."
        );
    }


    // =========================================
    // SAVE VIDEO
    // =========================================

    const {
        error
    } = await supabase
        .from("favorite_videos")
        .insert([
            {
                favorite_id:
                    currentVideoFavorite.id,

                video_url:
                    videoUrl,

                title:
                    metadata?.title || null,

                thumbnail_url:
                    metadata?.thumbnail_url
                        ? metadata.thumbnail_url.replace(
                            /&amp;/g,
                            "&"
                        )
                        : null,

                domain:
                    metadata?.domain || null
            }
        ]);


    if (error) {

        console.error(
            "Could not add video:",
            error
        );

        alert(
            "Could not add video."
        );

        return;
    }


    // =========================================
    // CLOSE ADD VIDEO POPUP
    // =========================================

    addVideoModal.classList.add(
        "hidden"
    );

    videoUrlInput.value = "";


    // =========================================
    // REFRESH VIDEO VAULT
    // =========================================

    await openVideoVault(
        currentVideoFavorite
    );

    await loadFavorites();
}

addVideoForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        await addVideo();

    }
);

// =========================================
// MANAGE MODE
// =========================================

let manageMode = false;
// =========================================
// VIDEO DATA
// =========================================

const favoriteVideoCounts = new Map();
// =========================================
// LOAD CURRENT SESSION
// =========================================

async function loadSession() {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    currentUser = session?.user ?? null;

}


// =========================================
// AUTH STATE LISTENER
// =========================================

supabase.auth.onAuthStateChange(
    (_event, session) => {

        currentUser = session?.user ?? null;

        console.log(
            "Authentication state:",
            currentUser ? "Signed in" : "Signed out"
        );

    }
);


// =========================================
// LOGIN MODAL
// =========================================

function openLoginModal() {

    loginError.textContent = "";

    loginError.classList.add("hidden");

    loginPassword.value = "";

    loginModal.classList.remove("hidden");

    setTimeout(() => {
        loginEmail.focus();
    }, 50);
}


function closeLoginModal() {

    loginModal.classList.add("hidden");

}


// =========================================
// LOGIN
// =========================================

async function login() {

    const email = loginEmail.value.trim();

    const password = loginPassword.value;


    loginError.textContent = "";

    loginError.classList.add("hidden");

    loginSubmit.disabled = true;

    loginSubmit.textContent = "Signing in...";


    const {
        data,
        error
    } = await supabase.auth.signInWithPassword({
        email,
        password
    });


    if (error) {

        console.error("Login failed:", error);

        loginError.textContent =
            "Incorrect email or password.";

        loginError.classList.remove("hidden");

        loginSubmit.disabled = false;

        loginSubmit.textContent = "Sign in";

        return;
    }


    currentUser = data.user;

    closeLoginModal();

    loginSubmit.disabled = false;

    loginSubmit.textContent = "Sign in";

    console.log("Owner signed in successfully.");

}
// =========================================
// ADD FAVORITE MODAL
// =========================================

let editingFavoriteId = null;

function openAddModal() {

    editingFavoriteId = null;

    addError.textContent = "";

    addError.classList.add("hidden");

    addForm.reset();

    imagePreview.classList.add("hidden");

    previewImage.removeAttribute("src");

    document.getElementById("add-title").textContent =
        "Add Favorite";

    addSubmit.textContent =
        "Add Favorite";

    addModal.classList.remove("hidden");

    setTimeout(() => {
        favoriteName.focus();
    }, 50);
}
function openEditModal(favorite) {

    editingFavoriteId = favorite.id;

    addError.textContent = "";

    addError.classList.add("hidden");

    favoriteName.value = favorite.name;

    favoriteImageUrl.value = favorite.image_url;

    document.getElementById("add-title").textContent =
        "Edit Favorite";

    addSubmit.textContent =
        "Save Changes";

    previewImage.src =
        favorite.image_url;

    addModal.classList.remove("hidden");

}

function closeAddModal() {

    addModal.classList.add("hidden");

}


// =========================================
// IMAGE PREVIEW
// =========================================

favoriteImageUrl.addEventListener(
    "input",
    () => {

        const url =
            favoriteImageUrl.value.trim();

        if (!url) {

            imagePreview.classList.add("hidden");

            previewImage.removeAttribute("src");

            return;
        }

        previewImage.src = url;

    }
);


previewImage.addEventListener(
    "load",
    () => {

        imagePreview.classList.remove("hidden");

    }
);


previewImage.addEventListener(
    "error",
    () => {

        imagePreview.classList.add("hidden");

        previewImage.removeAttribute("src");

    }
);


// =========================================
// ADD FAVORITE TO DATABASE
// =========================================

// =========================================
// ADD / EDIT FAVORITE
// =========================================



async function addFavorite() {

    const name =
        favoriteName.value.trim();

    const imageUrl =
        favoriteImageUrl.value.trim();


    addError.textContent = "";

    addError.classList.add("hidden");


    // Check required fields
    if (!name || !imageUrl) {

        addError.textContent =
            "Please enter both a name and an image URL.";

        addError.classList.remove("hidden");

        return;
    }


    // Make sure owner is signed in
    if (!currentUser) {

        closeAddModal();

        openLoginModal();

        return;
    }


    addSubmit.disabled = true;


    // =========================================
    // EDIT EXISTING FAVORITE
    // =========================================

    if (editingFavoriteId !== null) {

        addSubmit.textContent =
            "Saving...";


        const { error } =
            await supabase
                .from("favorites")
                .update({
                    name: name,
                    image_url: imageUrl
                })
                .eq(
                    "id",
                    editingFavoriteId
                );


        if (error) {

            console.error(
                "Could not edit favorite:",
                error
            );

            addError.textContent =
                "Could not save the changes.";

            addError.classList.remove(
                "hidden"
            );

            addSubmit.disabled = false;

            addSubmit.textContent =
                "Save Changes";

            return;
        }

    } else {

        // =========================================
        // ADD NEW FAVORITE
        // =========================================

        addSubmit.textContent =
            "Adding...";


        const { error } =
            await supabase
                .from("favorites")
                .insert({
                    name: name,
                    image_url: imageUrl
                });


        if (error) {

            console.error(
                "Could not add favorite:",
                error
            );

            addError.textContent =
                "Could not add this favorite.";

            addError.classList.remove(
                "hidden"
            );

            addSubmit.disabled = false;

            addSubmit.textContent =
                "Add Favorite";

            return;
        }
    }


    // =========================================
    // FINISH
    // =========================================

    editingFavoriteId = null;

    addSubmit.disabled = false;

    addSubmit.textContent =
        "Add Favorite";

    closeAddModal();

    await loadFavorites();

}
// =========================================
// BUTTON EVENTS
// =========================================

addButton.addEventListener(
    "click",
    () => {

        if (!currentUser) {

            openLoginModal();

            return;
        }

        openAddModal();

    }
);


manageButton.addEventListener(
    "click",
    () => {

        if (!currentUser) {

            openLoginModal();

            return;
        }

        enterManageMode();

    }
);

doneButton.addEventListener(
    "click",
    () => {

        exitManageMode();

    }
);


loginClose.addEventListener(
    "click",
    closeLoginModal
);


addClose.addEventListener(
    "click",
    closeAddModal
);


addCancel.addEventListener(
    "click",
    closeAddModal
);


addForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        await addFavorite();

    }
);


// Close Add modal when clicking outside

addModal.addEventListener(
    "click",
    (event) => {

        if (event.target === addModal) {

            closeAddModal();

        }

    }
);


loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        await login();

    }
);


// Close Login modal when clicking outside

loginModal.addEventListener(
    "click",
    (event) => {

        if (event.target === loginModal) {

            closeLoginModal();

        }

    }
);


// Close Video Vault

videoClose.addEventListener(
    "click",
    () => {

        videoModal.classList.add(
            "hidden"
        );

    }
);

videoAddButton.addEventListener(
    "click",
    () => {

        videoUrlInput.value = "";

        addVideoModal.classList.remove(
            "hidden"
        );

        videoUrlInput.focus();

    }
);


addVideoClose.addEventListener(
    "click",
    () => {

        addVideoModal.classList.add(
            "hidden"
        );

    }
);


addVideoCancel.addEventListener(
    "click",
    () => {

        addVideoModal.classList.add(
            "hidden"
        );

    }
);


// Close Add Video popup when clicking outside
addVideoModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === addVideoModal
        ) {

            addVideoModal.classList.add(
                "hidden"
            );

        }

    }
);

// Close Video Vault when clicking outside

videoModal.addEventListener(
    "click",
    (event) => {

        if (event.target === videoModal) {

            videoModal.classList.add(
                "hidden"
            );

        }

    }
);


// =========================================
// DELETE FAVORITE
// =========================================

async function deleteFavorite(favorite) {

    const confirmed =
        window.confirm(
            `Delete "${favorite.name}"?`
        );


    if (!confirmed) {
        return;
    }


    const { error } =
        await supabase
            .from("favorites")
            .delete()
            .eq(
                "id",
                favorite.id
            );


    if (error) {

        console.error(
            "Could not delete favorite:",
            error
        );

        alert(
            "Could not delete this favorite."
        );

        return;
    }


    await loadFavorites();

}
// =========================================
// MANAGE MODE
// =========================================

function enterManageMode() {

    manageMode = true;

    gallery.classList.add("manage-mode");

    doneButton.classList.remove("hidden");

    addButton.classList.add("hidden");

    manageButton.classList.add(
        "hidden"
    );

    loadFavorites();
}


function exitManageMode() {

    manageMode = false;

    gallery.classList.remove(
        "manage-mode"
    );

    doneButton.classList.add("hidden");

    addButton.classList.remove("hidden");

    manageButton.classList.remove(
        "hidden"
    );

    loadFavorites();
}

// =========================================
// LOAD FAVORITES
// =========================================

async function loadFavorites() {

    gallery.innerHTML = `
        <div class="loading-state">
            Loading favorites...
        </div>
    `;


    // =========================================
    // LOAD FAVORITES
    // =========================================

    const {
        data: favorites,
        error: favoritesError
    } = await supabase
        .from("favorites")
        .select("id, name, image_url")
        .order("id", {
            ascending: true
        });


    if (favoritesError) {

        console.error(
            "Could not load favorites:",
            favoritesError
        );

        gallery.innerHTML = `
            <div class="error-state">
                Unable to load favorites.
            </div>
        `;

        return;
    }


    if (!favorites || favorites.length === 0) {

        gallery.innerHTML = `
            <div class="empty-state">
                No favorites added yet.
            </div>
        `;

        favoriteVideoCounts.clear();

        return;
    }


    // =========================================
    // LOAD VIDEOS
    // =========================================

    const {
        data: videos,
        error: videosError
    } = await supabase
        .from("favorite_videos")
        .select("id, favorite_id");


    if (videosError) {

        console.error(
            "Could not load favorite videos:",
            videosError
        );

        // We don't stop the gallery if videos fail.
        favoriteVideoCounts.clear();

    } else {

        favoriteVideoCounts.clear();


        videos.forEach((video) => {

            const currentCount =
                favoriteVideoCounts.get(
                    video.favorite_id
                ) || 0;


            favoriteVideoCounts.set(
                video.favorite_id,
                currentCount + 1
            );

        });

    }


    // =========================================
    // DISPLAY FAVORITES
    // =========================================

    gallery.innerHTML = "";


    favorites.forEach((favorite) => {

        const card =
            createFavoriteCard(favorite);

        gallery.appendChild(card);

    });
}


// =========================================
// CREATE FAVORITE CARD
// =========================================

function createFavoriteCard(favorite) {

    const card =
        document.createElement("article");

    card.className = "favorite-card";
    const videoCount =
    favoriteVideoCounts.get(favorite.id) || 0;


if (videoCount > 0 || manageMode) {

    const videoBadge =
        document.createElement("button");

    videoBadge.className =
        "video-badge";

    videoBadge.type =
        "button";

    if (videoCount > 0) {

        videoBadge.textContent =
            `▶ ${videoCount}`;

        videoBadge.title =
            `Open ${videoCount} video${videoCount === 1 ? "" : "s"}`;

    } else {

        videoBadge.textContent =
            "+ Video";

        videoBadge.title =
            "Add a video";

    }

    videoBadge.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            openVideoVault(
                favorite
            );

        }
    );

    card.appendChild(
        videoBadge
    );
}
    if (manageMode) {

    const controls =
        document.createElement("div");

    controls.className =
        "card-management";


    const editButton =
        document.createElement("button");

    editButton.className =
        "card-action";

    editButton.type =
        "button";

    editButton.textContent =
        "✎";

    editButton.title =
        "Edit";


    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "card-action card-delete";

    deleteButton.type =
        "button";

    deleteButton.textContent =
        "−";

    deleteButton.title =
        "Delete";


    editButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            openEditModal(favorite);

        }
    );


    deleteButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            deleteFavorite(favorite);

        }
    );


    controls.appendChild(editButton);

    controls.appendChild(deleteButton);

    card.appendChild(controls);
}


    const imageWrapper =
        document.createElement("div");

    imageWrapper.className =
        "favorite-image-wrapper";


    const image =
        document.createElement("img");

    image.className =
        "favorite-image";

    image.src =
        favorite.image_url;

    image.alt =
        favorite.name;

    image.loading =
        "lazy";


    image.addEventListener(
        "error",
        () => {

            image.removeAttribute("src");

            image.style.display = "none";

            imageWrapper.style.display = "flex";

            imageWrapper.style.alignItems =
                "center";

            imageWrapper.style.justifyContent =
                "center";

            imageWrapper.textContent =
                "Image unavailable";

        }
    );


    const name =
        document.createElement("h2");

    name.className =
        "favorite-name";

    name.textContent =
        favorite.name;


    imageWrapper.appendChild(image);

    card.appendChild(imageWrapper);

    card.appendChild(name);


    return card;
}


// =========================================
// START APPLICATION
// =========================================

await loadSession();

await loadFavorites();