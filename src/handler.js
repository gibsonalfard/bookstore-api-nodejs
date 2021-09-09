const books = require("./books")
const {nanoid} = require('nanoid')

const addBookHandler = (request, h) => {
    const { name, year, author, summary, publisher, pageCount, readPage,
    reading} = request.payload

    const bookId = nanoid(16)
    const finished = pageCount === readPage
    const insertedAt = new Date().toISOString()
    const updatedAt = insertedAt

    // Check if Request Body Incomplete. Name is undefined
    let error = false
    let errorMessage = ""

    if(name === undefined){
        errorMessage = "Gagal menambahkan buku. Mohon isi nama buku"
        error = true
    }else if(readPage > pageCount){
        errorMessage = "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount"
        error = true
    }

    if(error){
        const response = h.response({
            "status": "fail",
            "message": errorMessage
        })

        response.code(400)

        return response
    }

    const book = {
        id: bookId, name, year, author, summary, publisher, pageCount, readPage, finished, reading,
        insertedAt, updatedAt
    }

    books.push(book);

    if(books.filter((b) => b.id === bookId).length > 0){
        const response = h.response({
            "status": "success",
            "message": "Buku berhasil ditambahkan",
            "data": {
                "bookId": bookId
            }
        })

        response.code(201)

        return response
    }

    const response = h.response({
        "status": "error",
        "message": "Buku gagal ditambahkan"
    })

    response.code(500)

    return response
}

const getAllBooksHandler = (request, h) => {
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

    const mappedBook = filteredBook.map(({id, name, publisher}) => ({id, name, publisher}))

    const response = h.response({
        "status": "success",
        "data": {
            "books": mappedBook
        }
    })

    return response
}

const getBooksByIdHandler = (request, h) => {
    const { id } = request.params
    const book = books.filter((n) => n.id === id)[0]

    if(book !== undefined){
        return {
            "status": "success",
            "data": {
                book
            }
        }
    }

    const response = h.response({
        "status": "fail",
        "message": "Buku tidak ditemukan"
    })

    response.code(404)
    return response
}

const editBookByIdHandler = (request, h) => {
    const { id } = request.params
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload

    const updatedAt = new Date().toISOString()
    let error = false
    let errorMessage = ""

    if(name === undefined){
        error = true
        errorMessage = "Gagal memperbarui buku. Mohon isi nama buku"
    }else if(readPage > pageCount){
        error = true
        errorMessage = "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount"
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
        const book = books.filter((n) => n.id === id)[0]
        book.name = name
        book.year = year
        book.author = author
        book.summary = summary
        book.publisher = publisher
        book.pageCount = pageCount
        book.readPage = readPage
        book.reading = reading
        book.updatedAt = updatedAt

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

const deleteBookByIdHandler = (request, h) => {
    const { id } = request.params
    let response = undefined
    const index = books.findIndex((book) => book.id === id)

    if(index >= 0){
        books.splice(index, 1)
        response = h.response({
            "status": "success",
            "message": "Buku berhasil dihapus"
        })
        response.code(200)
    }else{
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