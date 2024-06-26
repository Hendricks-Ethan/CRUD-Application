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
    constructor (productName, costPerCase, unitsPerCase, casesOnHand, unitsOnHand) {
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
        return $.ajax({
            url: this.apiUrl,
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(categoryData),
        });
   }

   static updateCategory (id, updatedData) {
        return $.ajax({
            url: this.apiUrl + `/${id}`,
            method: "PUT",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(updatedData),
        });
   }

   static deleteCategory (id) {
        return $.ajax({
            url: this.apiUrl + `/${id}`,
            method: "DELETE",
            dataType: "json",
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
        InventoryService.deleteCategory(id)
            .then(() => {
                return InventoryService.getAllCategories();
            })
            .then((categories) => this.render(categories));
    }

    static addProduct(id) {
        for(let category of this.categories) {
            if(category.id == id) {
                category.products.push(new Product($(`#${category.id}-product-name`).val(),
                    $(`#${category.id}-cost-per-case`).val(),
                    $(`#${category.id}-units-per-case`).val(),
                    $(`#${category.id}-cases-on-hand`).val(),
                    $(`#${category.id}-units-on-hand`).val()));
                InventoryService.updateCategory(id, category)
                    .then(() => {
                        return InventoryService.getAllCategories();
                    })
                    .then((categories) => this.render(categories));
            }
        }
    }

    static deleteProduct(categoryId, productId) {
        for (let category of this.categories) {
            if (category.id == categoryId) {
                for (let product of category.products) {
                    if (`${product.productName}-product-row` == productId) {
                        category.products.splice(category.products.indexOf(product), 1);
                        InventoryService.updateCategory(categoryId, category)
                            .then(async () => {
                                const categories = await InventoryService.getAllCategories();
                                return this.render(categories);   
                            });
                    }
                }
            }
        }
    }

    static render(categories) {
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
                $(`#${category.id}`).find(`#${category.id}-product-table`).append(
                    `<tr id="${product.productName}-product-row">
                        <td id="product-name-${category.id}">${product.productName}</td>
                        <td id="cost-per-case-${category.id}">${product.costPerCase}</td>
                        <td id="units-per-case-${category.id}">${product.unitsPerCase}</td>
                        <td id="cases-on-hand-${category.id}">${product.casesOnHand}</td>
                        <td id="units-on-hand-${category.id}">${product.unitsOnHand}</td>
                        <td class="text-center">
                            <button class="btn btn-danger" onclick="DOMManager.deleteProduct('${category.id}', '${product.productName}-product-row')">Delete Product</button>
                        </td>
                    </tr>
                    `
                );
            }
        }
    }
}

$('#create-category').on('click', () => {
    DOMManager.createCategory($('#category-name').val());
    $('#category-name').val('');
});

DOMManager.getAllCategories();