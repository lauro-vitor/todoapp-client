const uri = "http://localhost:5000/api/Todo/";

$(document).ready(async function () {
    try {
        await loadUserSelect("#todoFilterUserSelect");
        await todoGetItens({
            name:"",
            isDone:null,
            userId:null
        });
    } catch (err) {
        console.error(err);
        alert(err);
    }
});


//#region AJAX
function sentAuthentication(jqXHR) {
    const token = "Bearer " + localStorage.getItem("login_token");
    jqXHR.setRequestHeader("Authorization", token);
}
function redirectUnhatorized(jqXHR) {
    if (jqXHR.status == 401)
        window.open("file:///C:/Users/Pichau/source/repos/TodoAppClient/Pages/Login.html", "_self");
    else
        throw jqXHR.responseText;
}

function todoGetItens(todo) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "GET",
            url: uri,
            cache: false,
            beforeSend: function (jqXHR) {
                sentAuthentication(jqXHR)
            },
            success: function (data) {
                const todos = $("#todos");
                if (data) {
                    todos.empty();
                    data.forEach(t => {
                        todos.append(
                            $("<tr></tr>")
                                .append($("<td></td>").text(t.userName))
                                .append($("<td></td>").text(t.name))
                                .append($("<td></td>").append(t.isDone ?
                                    $("<i></i>").addClass("fa fa-check").css("color", "green") :
                                    $("<i></i>").addClass("fa fa-check").css("color", "red")))
                                .append($("<td></td>")
                                    .append($("<i></i>").prop("id", "todoEditButton")
                                        .addClass("fa fa-pencil")
                                        .css("cursor", "pointer")
                                        .on("click", function () {
                                            todoOpenModal_click(t.todoId);
                                        }))
                                    .append($("<i></i>").prop("id", "todoDeleteButton")
                                        .addClass("fa fa-trash")
                                        .css("cursor", "pointer")
                                        .on("click", function () {
                                            todoDelete_click(t.todoId);
                                        }))
                                )
                        );
                    });
                    resolve();
                } else
                    reject("Ocurring an error");
            },
            error: function (jqXHR) {
                try {
                    redirectUnhatorized(jqXHR);
                } catch (err) {
                    reject(err);
                }
            }
        });
    })
}
function todoGetItemById(todoId) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "GET",
            cache: false,
            url: uri + todoId,
            beforeSend: function (jqXHR) {
                sentAuthentication(jqXHR);
            },
            success: function (data) {
                if (data)
                    resolve(data);
                else
                    reject("Ocurring an error!");
            },
            error: function (jqXHR) {
                try {
                    redirectUnhatorized(jqXHR);
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}
function todoAddItem() {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "POST",
            url: uri,
            cache: false,
            contentType: "application/json",
            data: JSON.stringify({
                name: $("#todoModalInputName").val(),
                userId: $("#todoModalSelectUser option:selected").val(),
                isDone: $('#todoModalInputIsDone').prop("checked"),
            }),
            beforeSend: function (jqXHR) {
                sentAuthentication(jqXHR);
            },
            success: function (data) {
                resolve();
            },
            error: function (jqXHR) {
                try {
                    redirectUnhatorized(jqXHR);
                } catch (err) {
                    reject(err);
                }
            },
        });
    });
}

function todoEditItem(todoId) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "PUT",
            url: uri + todoId,
            cache: false,
            beforeSend: function (jqXHR) {
                sentAuthentication(jqXHR);
            },
            contentType: "application/json",
            data: JSON.stringify({
                todoId,
                name: $("#todoModalInputName").val(),
                userId: $("#todoModalSelectUser option:selected").val(),
                isDone: $("#todoModalInputIsDone").prop("checked")
            }),
            success: function (data) {
                resolve();
            },
            error: function (jqXHR) {
                try {
                    redirectUnhatorized(jqXHR);
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}
function todoDeleteItem(id) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "DELETE",
            url: uri + id,
            cache: false,
            beforeSend: function (jqXHR) {
                sentAuthentication(jqXHR);
            },
            success: function (jqXHR) {
                resolve();
            },
            error: function (jqXHR) {
                try {
                    redirectUnhatorized(jqXHR);
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}

function loadUserSelect(controlId) {
    const control = $(controlId);
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "GET",
            cache: false,
            beforeSend: function (jqXHR) {
                sentAuthentication(jqXHR);
            },
            url: "http://localhost:5000/api/User/",
            success: function (data) {
                if (data != null) {
                    control.empty();
                    control.append($("<option></option>")
                        .attr("value", "-1")
                        .text("(Select an User)"));

                    data.forEach(u => {
                        control.append($("<option></option>")
                            .attr("value", u.userId)
                            .text(u.name));
                    });
                    resolve();
                } else
                    reject("bad request for search users!");
            },
            error: function (jqXHR) {
                try {
                    redirectUnhatorized(jqXHR);
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}

//#endregion 

//#region  EVENTS

async function todoOpenModal_click(todoId) {
    try {
        await loadUserSelect("#todoModalSelectUser");

        if (todoId == null) {
            $("#todoModalInputName").val("");
            $('#todoModalInputIsDone').prop('checked', false);
            $("#todoIdInputHidden").val("");
        } else {
            const todo = await todoGetItemById(todoId);
            $('#todoIdInputHidden').val(todo.todoId);
            $('#todoModalInputName').val(todo.name);
            $('#todoModalInputIsDone').prop('checked', todo.isDone);
            if (todo.userId != null)
                $(`#todoModalSelectUser > option[value='${todo.userId}']`).prop("selected", true);
            else
                $("#todoModalSelectUser > option[value='-1']").prop("selected", true);
        }

        $('#todoModal').modal('show');
    } catch (err) {
        console.error(err);
        alert(err);
    }
}

async function todoSave_click() {
    try {
        const todoId = $('#todoIdInputHidden').val();

        if ($('#todoModalInputName').val() == "" || $('#todoModalSelectUser option:selected').val() == "-1") {
            throw "Please fill the mandatory fields!";
        }

        if (todoId === "")
            await todoAddItem();
        else
            await todoEditItem(todoId);

        await todoGetItens();
        alert("Your changes are saved with success!");
        $('#todoModal').modal("hide");
    } catch (err) {
        console.error(err);
        alert(err);
    }
}
async function todoDelete_click(id) {
    try {
        await todoDeleteItem(id);
        await todoGetItens();
        alert("Your changes are saved with succesfully!");
    } catch (err) {
        alert(err.responseText);
    }
}

async function todoFilter() {
    try {

    } catch (err) {

    }
}

//#endregion




