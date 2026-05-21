from fastapi import Request, HTTPException

async def search_limit(request:Request, call_next):

    token = request.headers.get("Authorization")

    if not token:
        return await call_next(request)

    user = get_user_from_token(token)

    if user["plan"]=="free" and user["search_count"]>=5:

        raise HTTPException(
            status_code=402,
            detail="Free search limit reached. Upgrade plan."
        )

    response = await call_next(request)

    db.users.update_one(
        {"_id":user["_id"]},
        {"$inc":{"search_count":1}}
    )

    return response