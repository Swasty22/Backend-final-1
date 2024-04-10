class apiError extends Error{
    constructor(
        statuscode,
        message='something went wrong',
        error=[],
        
    ){
        //to overwrite
        super(message)
        this.statuscode=statuscode
        this.data=this.data
        this.message=message
        this.success=false
        this.error=error
       
    }
}
export {apiError}