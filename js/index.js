var menuIcon = document.getElementById("menuIcon");
var closeIcon = document.getElementById("closeIcon");
var navTab = document.getElementById("navTab");
var meal = document.querySelector(".meal");
$(function() {
    $(".loader").fadeOut(1000, function(){
        $(".loading").slideUp(1000, function(){
            $("body").css({"overflow": "auto"});
            $(".loading").remove();
        });
    });
});
function menuSide(){
    menuIcon.classList.toggle("d-none");
    closeIcon.classList.toggle("d-none");
    navTab.classList.toggle("d-none");
}
function closeSide(){
    menuIcon.classList.toggle("d-none");
    closeIcon.classList.toggle("d-none");
    navTab.classList.toggle("d-none");
}
async function getMeals(){
    try{
        var url = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=`);
        var dataApi = await url.json();
        displayData(dataApi.meals);
    } catch(Error){
        console.log("Error");
    }
}
getMeals();
function displayData(meals){
    let meal = '';
    let count = Math.min(meals.length, 20);
    for(let i = 0; i < count; i++){
        meal += `
        <div class="col-md-3 ">
            <div class="meal position-relative overflow-hidden rounded-2" data-id="${meals[i].idMeal}">
                <img src="${meals[i].strMealThumb}" class="w-100 images" alt="${meals[i].strMeal}">
                <div class="meal-layer position-absolute rounded-2 d-flex align-items-center">
                    <h3>${meals[i].strMeal}</h3>
                </div>
            </div>
        </div>
        `;
    }
    $("#rowData").html(meal);
    $(".meal").on("click", function() {
        const mealId = $(this).data("id");
        getMealDetails(mealId);
    });
}
$("#searchLink").on("click", function() {
    showSearchInputs();
    $("#rowData").html("");
    });
$("#categoriesLink").on("click", function() {
    showCategories();
});
$("#areaLink").on("click", function() {
    showAreas();
});
async function getMealDetails(mealId) {
    $("#searchContainer").html("");
    try {
        let res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        let data = await res.json();
        let meal = data.meals[0];

        let ingredients = '';
        for(let i=1; i<=20; i++) {
            if(meal[`strIngredient${i}`]) {
                ingredients += `<li class="alert alert-info m-2 p-1">${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`;
            }
        }

        let tags = meal.strTags ? meal.strTags.split(',').map(tag => `<span class="badge-tag rounded-2 p-1 m-2 mx-1">${tag}</span>`).join('') : '';

        let details = `
            <div class="col-md-4 text-white">
                <img src="${meal.strMealThumb}" class="w-100 rounded-3" alt="${meal.strMeal}">
                <h2>${meal.strMeal}</h2>
            </div>
            <div class="col-md-8 text-white">
                <h3>Instructions</h3>
                <p>${meal.strInstructions}</p>
                <h3>Area: <span class="badge">${meal.strArea}</span></h3>
                <h3>Category: <span class="badge">${meal.strCategory}</span></h3>
                <h3>Recipes:</h3>
                <ul class="list-unstyled d-flex g-3 flex-wrap">${ingredients}</ul>
                <h3 class="m-2">Tags:</h3>
                <div class="tag m-3">${tags}</div>
                <a href="${meal.strSource}" target="_blank" class="btn btn-success my-2">Source</a>
                <a href="${meal.strYoutube}" target="_blank" class="btn btn-danger my-2">YouTube</a>
            </div>
        `;
        $("#rowData").html(details);
    } catch (err) {
        $("#rowData").html("<div class='text-danger'>Error loading meal details.</div>");
    }
}

function showSearchInputs() {
    $("#searchContainer").html(`
        <div class="row my-4">
            <div class="col-md-6">
                <input type="text" id="searchByName" class="form-control bg-transparent text-white" placeholder="Search By Name...">
            </div>
            <div class="col-md-6">
                <input type="text" id="searchByLetter" maxlength="1" class="form-control bg-transparent text-white" placeholder="Search By First Letter...">
            </div>
        </div>
    `);
    $("#searchByName").on("input", function() {
        let name = $(this).val();
        searchMealsByName(name);
    });
    $("#searchByLetter").on("input", function() {
        let letter = $(this).val();
        searchMealsByFirstLetter(letter);
    });
}
async function searchMealsByName(name) {
    if (!name) {
        $("#rowData").html("");
        return;
    }
    let res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`);
    let data = await res.json();
    displayData(data.meals || []);
}
async function searchMealsByFirstLetter(letter) {
    if (!letter) {
        $("#rowData").html("");
        return;
    }
    let res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
    let data = await res.json();
    displayData(data.meals || []);
}

async function showCategories() {
    $("#searchContainer").html(""); 
    $("#rowData").html('<div class="text-center my-5"><span class="loader"></span></div>'); 

    try {
        let res = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
        let data = await res.json();
        let cats = data.categories;

        let catsHtml = '';
        for (let i = 0; i < cats.length; i++) {
            catsHtml += `
                <div class="col-md-3">
                    <div class="category-card text-center p-3 rounded-3 bg-light" style="cursor:pointer" data-category="${cats[i].strCategory}">
                        <img src="${cats[i].strCategoryThumb}" class="w-100 rounded-3 mb-2" alt="${cats[i].strCategory}">
                        <h5>${cats[i].strCategory}</h5>
                        <p class="small">${cats[i].strCategoryDescription.split(" ").slice(0,15).join(" ")}...</p>
                    </div>
                </div>
            `;
        }
        $("#rowData").html(`<div class="row g-4">${catsHtml}</div>`);

        $(".category-card").on("click", function() {
            let cat = $(this).data("category");
            getMealsByCategory(cat);
        });
    } catch {
        $("#rowData").html("<div class='text-danger'>Error loading categories.</div>");
    }
}

async function getMealsByCategory(category) {
    $("#rowData").html('<div class="text-center my-5"><span class="loader"></span></div>');
    try {
        let res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        let data = await res.json();
        displayData(data.meals || []);
    } catch {
        $("#rowData").html("<div class='text-danger'>Error loading meals.</div>");
    }
}

async function showAreas() {
    $("#searchContainer").html(""); 
    $("#rowData").html('<div class="text-center my-5"><span class="loader"></span></div>'); 

    try {
        let res = await fetch("https://www.themealdb.com/api/json/v1/1/list.php?a=list");
        let data = await res.json();
        let areas = data.meals;

        let areasHtml = '';
        for (let i = 0; i < areas.length; i++) {
            areasHtml += `
                <div class="col-md-3">
                    <div class="area-card text-center p-3 rounded-3 bg-light" style="cursor:pointer" data-area="${areas[i].strArea}">
                        <i class="fa-solid fa-house-laptop fa-3x mb-2"></i>
                        <h5>${areas[i].strArea}</h5>
                    </div>
                </div>
            `;
        }
        $("#rowData").html(`<div class="row g-4">${areasHtml}</div>`);

        $(".area-card").on("click", function() {
            let area = $(this).data("area");
            getMealsByArea(area);
        });
    } catch {
        $("#rowData").html("<div class='text-danger'>Error loading areas.</div>");
    }
}

async function getMealsByArea(area) {
    $("#rowData").html('<div class="text-center my-5"><span class="loader"></span></div>');
    try {
        let res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
        let data = await res.json();
        displayData(data.meals || []);
    } catch {
        $("#rowData").html("<div class='text-danger'>Error loading meals.</div>");
    }
}

async function showIngredients() {
    $("#searchContainer").html("");
    $("#rowData").html('<div class="text-center my-5"><span class="loader"></span></div>');

    try {
        let res = await fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list");
        let data = await res.json();
        let ingredients = data.meals;

        let ingredientsHtml = '';
        for (let i = 0; i < Math.min(ingredients.length, 20); i++) {
            ingredientsHtml += `
                <div class="col-md-3">
                    <div class="ingredient-card text-center p-3 rounded-3" style="cursor:pointer" data-ingredient="${ingredients[i].strIngredient}">
                        <i class="fa-solid fa-drumstick-bite fa-3x mb-2"></i>
                        <h5>${ingredients[i].strIngredient}</h5>
                        <p class="small">${ingredients[i].strDescription ? ingredients[i].strDescription.split(" ").slice(0,10).join(" ") : ""}...</p>
                    </div>
                </div>
            `;
        }
        $("#rowData").html(`<div class="row g-4">${ingredientsHtml}</div>`);

        $(".ingredient-card").on("click", function() {
            let ingredient = $(this).data("ingredient");
            getMealsByIngredient(ingredient);
        });
    } catch {
        $("#rowData").html("<div class='text-danger'>Error loading ingredients.</div>");
    }
}

async function getMealsByIngredient(ingredient) {
    $("#rowData").html('<div class="text-center my-5"><span class="loader"></span></div>');
    try {
        let res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        let data = await res.json();
        displayData(data.meals || []);
    } catch {
        $("#rowData").html("<div class='text-danger'>Error loading meals.</div>");
    }
}

$("#ingredientsLink").on("click", function() {
    showIngredients();
});

function showContactForm() {
    $("#searchContainer").html("");
    $("#rowData").html(`
        <form id="contactForm" class="row w-75 g-4">
            <div class="col-md-6">
                <input type="text" id="nameInput" class="form-control" placeholder="Name">
                <div class="invalid-feedback">Special characters and numbers not allowed</div>
            </div>
            <div class="col-md-6">
                <input type="email" id="emailInput" class="form-control" placeholder="Email">
                <div class="invalid-feedback">Email not valid <br> *exemple@yyy.zzz</div>
            </div>
            <div class="col-md-6">
                <input type="text" id="phoneInput" class="form-control" placeholder="Phone">
                <div class="invalid-feedback">Enter valid Phone Number</div>
            </div>
            <div class="col-md-6">
                <input type="number" id="ageInput" class="form-control" placeholder="Age">
                <div class="invalid-feedback">Enter valid age</div>
            </div>
            <div class="col-md-6">
                <input type="password" id="passwordInput" class="form-control" placeholder="Password">
                <div class="invalid-feedback">Enter valid password *Minimum eight characters, at least one letter and one number:*</div>
            </div>
            <div class="col-md-6">
                <input type="password" id="repasswordInput" class="form-control" placeholder="Re-enter Password">
                <div class="invalid-feedback">Passwords do not match.</div>
            </div>
            <div class="col-12 text-center">
                <button type="submit" id="submitBtn" class="btn btn-outline-danger px-2">Submit</button>
            </div>
        </form>
    `);
    $("#contactForm input").on("input", validateContactForm);
}

function validateContactForm() {
    const nameRegex = /^[A-Za-z ]{2,}$/;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const phoneRegex = /^01[0125][0-9]{8}$/;
    const ageRegex = /^(1[0-9]|[2-9][0-9]|100)$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

    let nameValid = nameRegex.test($("#nameInput").val());
    let emailValid = emailRegex.test($("#emailInput").val());
    let phoneValid = phoneRegex.test($("#phoneInput").val());
    let ageValid = ageRegex.test($("#ageInput").val());
    let passwordValid = passwordRegex.test($("#passwordInput").val());
    let repasswordValid = $("#passwordInput").val() === $("#repasswordInput").val() && passwordValid;

    $("#nameInput").toggleClass("is-invalid", !nameValid);
    $("#emailInput").toggleClass("is-invalid", !emailValid);
    $("#phoneInput").toggleClass("is-invalid", !phoneValid);
    $("#ageInput").toggleClass("is-invalid", !ageValid);
    $("#passwordInput").toggleClass("is-invalid", !passwordValid);
    $("#repasswordInput").toggleClass("is-invalid", !repasswordValid);
}
$("#contactLink").on("click", function() {
    showContactForm();
});