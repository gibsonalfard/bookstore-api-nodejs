const books = require("./books")
const mysql = require("../config/mysql")
const {nanoid} = require('nanoid')

const addBookHandler = async (request, h) => {
    const { name, year, author, summary, publisher, pageCount} = request.payload

    const bookId = nanoid(16)

    // Check if Request Body Incomplete. Name is undefined
    let error = false
    let errorMessage = ""

    if(name === undefined){
        errorMessage = "Gagal menambahkan buku. Mohon isi nama buku"
        error = true
    }

    // Create Error Message if something happen
    if(error){
        const response = h.response({
            "status": "fail",
            "message": errorMessage
        })

        response.code(400)

        return response
    }

    // Create Query for Data Addition to Database
    let params = []
    const query = `INSERT into books (id, title, year, author, summary, publisher, pageCount)
                    VALUES (?)`
    params.push([bookId, name, year, author, summary, publisher, pageCount])

    // Insert to database
    try{
        await mysql.addData(query, params)
        const response = h.response({
            "status": "success",
            "message": "Buku berhasil ditambahkan",
            "data": {
                "bookId": bookId
            }
        })

        response.code(201)

        return response
    }catch (e){
        const response = h.response({
            "status": "error",
            "message": "Buku gagal ditambahkan"
        })

        response.code(500)

        return response
    }
}

const getAllBooksHandler = async (request, h) => {
    const { name, reading, finished } = request.query
    let filteredBook = [...books]

    if(name){
        filteredBook = filteredBook.filter((str) => { return str.name.toLowerCase().includes(name.toLowerCase()); })
    }

    if(reading !== undefined){
        filteredBook = filteredBook.filter((b) => b.reading == reading)
    }

    if(finished !== undefined){
        filteredBook = filteredBook.filter((b) => b.finished == finished)
    }

    // Get Data From Database
    // const mappedBook = filteredBook.map(({id, name, publisher}) => ({id, name, publisher}))
    let query = "SELECT id, title, publisher FROM books"
    let mappedBook = await mysql.doQuery(query)

    const response = h.response({
        "status": "success",
        "data": {
            "books": mappedBook
        }
    })

    return response
}

const getBooksByIdHandler = async (request, h) => {
    const { id } = request.params

    // Get the book from DB
    let query = `SELECT * FROM books WHERE id = '${id}'`
    let book = await mysql.doQuery(query)

    if(book !== undefined){
        return {
            "status": "success",
            "data": {
                book
            }
        }
    }

    // Cannot find the book
    const response = h.response({
        "status": "fail",
        "message": "Buku tidak ditemukan"
    })

    response.code(404)
    return response
}

const editBookByIdHandler = async (request, h) => {
    const { id } = request.params
    const { name, year, author, summary, publisher, pageCount} = request.payload

    const updatedAt = new Date().toISOString()
    let error = false
    let errorMessage = ""

    // Check if title of Book doesn't exist
    if(name === undefined){
        error = true
        errorMessage = "Gagal memperbarui buku. Mohon isi nama buku"
    }

    if(error){
        const response = h.response({
            "status": "fail",
            "message": errorMessage
        })

        response.code(400)

        return response
    }

    try{
        // Update book record
        let query = `UPDATE books SET title='${name}', year=${year}, author='${author}',
                    summary='${summary}', publisher='${publisher}', pageCount=${pageCount}
                    WHERE id='${id}'`
        await mysql.doQuery(query)

        const response = h.response({
            "status": "success",
            "message": "Buku berhasil diperbarui"
        })

        return response
    }catch (e){
        console.log(e)
        const response = h.response({
            "status": "fail",
            "message": "Gagal memperbarui buku. Id tidak ditemukan"
        })

        response.code(404)
        return response
    }
}

const deleteBookByIdHandler = async (request, h) => {
    const { id } = request.params
    let response = undefined
    // const index = books.findIndex((book) => book.id === id)

    try{
        // Delete a book by id
        await mysql.doQuery(`DELETE FROM books WHERE id = '${id}'`)
        response = h.response({
            "status": "success",
            "message": "Buku berhasil dihapus"
        })
        response.code(200)
    }catch{
        // Error Response if book doesn't exist
        response = h.response({
            "status": "fail",
            "message": "Buku gagal dihapus. Id tidak ditemukan"
        })
        response.code(404)
    }

    return response
}

module.exports = {
    addBookHandler, getAllBooksHandler, getBooksByIdHandler,
    editBookByIdHandler, deleteBookByIdHandler
}