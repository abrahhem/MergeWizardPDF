

export const configFormat = {
    method: 'put',
    maxBodyLength: Infinity,
    url: '',
    headers: {
        'X-Api-Key': process.env.REACT_APP_SECRET_KEY,
        'tag': '',
        'Content-Type': ''
    },
    data : null
}