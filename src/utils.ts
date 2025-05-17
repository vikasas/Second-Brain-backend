export function hashlink(len : number): string{
    const options = "afesdgkjhlkdfhabwbeouf32382938922399";
    let hash = " ";
    for(let i = 0; i < len; i++){
        hash += options[Math.floor(Math.random() * options.length)];
    }
    return hash;
}