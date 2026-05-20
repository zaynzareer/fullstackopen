const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    reducer = (sum, item) => {
        return sum + item.likes
    }

    return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0)
}

const favouriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    }

    const reducer = (favourite, item) => {
        return item.likes > favourite.likes ? item : favourite
    }

    return blogs.reduce(reducer)
}


module.exports = { dummy, totalLikes, favouriteBlog }