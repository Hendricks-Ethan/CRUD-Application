class Category {
    constructor (categoryName) {
        this.categoryName = categoryName;
        this.products = [];
    }

    addProduct () {
        this.products.push(new Product(productName, costPerCase, unitsPerCase, casesOnHand, unitsOnHand));
    }
}

class Product {
    //NOTE - Lets go over this
    //FIXME Must create a product using the inputs in the constructor or you won't see the product in the table
    // constructor () {
    //     this.object = {};
    // }
    constructor(productName, costPerCase, unitsPerCase, casesOnHand, unitsOnHand) {
        this.productName = productName;
        this.costPerCase = costPerCase;
        this.unitsPerCase = unitsPerCase;
        this.casesOnHand = casesOnHand;
        this.unitsOnHand = unitsOnHand;
    }
}

class InventoryService {
    static apiUrl = "https://6674d9dc75872d0e0a97b21a.mockapi.io/api/my_projects/category";

    static getAllCategories () {
        return $.ajax({
            url: this.apiUrl,
            method: "GET",
            dataType: "json",
            contentType: "application/json",
        });
    }

   static getCategory (id) {
        return $.ajax({
            url: this.apiUrl + `/${id}`,
            method: "GET",
            dataType: "json",
            contentType: "application/json",
        });
   }

   static createCategory (categoryData) {
    console.log("Create Category Data: ",categoryData);

        return $.ajax({
            url: this.apiUrl,
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(categoryData),
        });
   }

   static updateCategory (id, updatedData) {
    console.log("id is coming in as: ", id)
    console.log("updatedData is coming in as: ", updatedData)

        return $.ajax({
            url: this.apiUrl + `/${id}`,
            method: "PUT",
            dataType: "json",
            contentType: "application/json",
            //NOTE - Lets talk about this!!!!
            // Must stringify the information to be sent to the server
            data: JSON.stringify(updatedData),
        });
   }

   static deleteCategory (id) {
    console.log("id is coming in as: ", id)
        return $.ajax({
            url: this.apiUrl + `/${id}`,
            method: "DELETE",
            contentType: "application/json",
        });
   }
}

class DOMManager {
    static categories;

    static getAllCategories () {
        InventoryService.getAllCategories().then(categories => this.render(categories));
    }

    static createCategory(name) {
        InventoryService.createCategory(new Category(name))
            .then(() => {
                return InventoryService.getAllCategories();
            })
            .then((categories) => this.render(categories));
    }

    static deleteCategory(id) {
        console.log("Delete Category id comes in in DOM as: ", id)
        InventoryService.deleteCategory(id)
            .then(() => {
                return InventoryService.getAllCategories();
            })
            .then((categories) => this.render(categories));
    }

    static addProduct(id) {
        console.log(id) //INFO - I added a constructor that actually creates a product object
        for(let category of this.categories) {
            if(category.id == id) {
                category.products.push(new Product($(`#${category.id}-product-name`).val(),
                    $(`#${category.id}-cost-per-case`).val(),
                    $(`#${category.id}-units-per-case`).val(),
                    $(`#${category.id}-cases-on-hand`).val(),
                    $(`#${category.id}-units-on-hand`).val()));
                console.log("Category: ", category.products)
                    //NOTE -- Passing in id and category object to updateCategory, previously it only had category in the parameters I added the id to the parameters
                InventoryService.updateCategory(id, category)
                    .then(() => {
                        return InventoryService.getAllCategories();
                    })
                    .then((categories) => this.render(categories));
            }
        }
    }

    static render(categories) {
        console.log(categories)
        this.categories = categories;
        $('#inventory').empty();
        for (let category of categories) {
            $("#inventory").append(
                `<div class="card" id="${category.id}">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-10">
                                <h2>${category.categoryName}</h2>
                            </div>
                            <div class="col-2">
                                <button class="btn btn-danger" onclick="DOMManager.deleteCategory('${category.id}')">Delete Category</button>
                            </div>
                        </div>
                    </div>

                    <br>

                    <div class="row">
                        <div class="col-3">
                            <input type="text" class="form-control" id="${category.id}-product-name" placeholder="Product Name">
                        </div>
                        <div class="col">
                            <input type="text" class="form-control" id="${category.id}-cost-per-case" placeholder="Cost Per Case">
                        </div>
                        <div class="col">
                            <input type="text" class="form-control" id="${category.id}-units-per-case" placeholder="Units Per Case">
                        </div>
                        <div class="col">
                            <input type="text" class="form-control" id="${category.id}-cases-on-hand" placeholder="Cases On Hand">
                        </div>
                        <div class="col">
                            <input type="text" class="form-control" id="${category.id}-units-on-hand" placeholder="Units On Hand">
                        </div>
                        <div class="col text-center">
                            <!-- This needed single quotes and was calling the wrong DOMManager method for adding a Product.  -->
                            <button class="btn btn-primary" id="${category.id}-create-product" onclick="DOMManager.addProduct('${category.id}')">Add Product</button>
                        </div>
                    </div>

                    <br>

                    <table class="table table-bordered">
                        <thead class="text-center">
                            <tr>
                                <th class="col-3">Product Name</th>
                                <th>Cost Per Case ($)</th>
                                <th>Units Per Case</th>
                                <th>Cases On Hand</th>
                                <th>Units On Hand</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="${category.id}-product-table">

                        </tbody>
                    </table>
                </div>
                <br>
                `
            );
            for (let product of category.products) {
                console.log("Category: ", category)
                $(`#${category.id}-product-table`).empty();
                $(`#${category.id}`).find(`#${category.id}-product-table`).append(
                    `<tr>
                        <td id="product-name-${category.id}">${product.productName}</td>
                        <td id="cost-per-case-${category.id}">${product.costPerCase}</td>
                        <td id="units-per-case-${category.id}">${product.unitsPerCase}</td>
                        <td id="cases-on-hand-${category.id}">${product.casesOnHand}</td>
                        <td id="units-on-hand-${category.id}">${product.unitsOnHand}</td>
                        <td class="text-center">
                            <button class="btn btn-danger">Delete Product</button>
                        </td>
                    </tr>
                    `
                );
            }
        }
    }
}

$('#create-category').on("click", () => {
    console.log("clicked")
    DOMManager.createCategory($('#category-name').val());
    $('#category-name').val("");
});

DOMManager.getAllCategories();