import pytest
from app.auth.security import hash_password, verify_password, create_access_token
from jose import jwt
from app.config import SECRET_KEY, ALGORITHM


def test_password_hash_and_verify():
    hashed = hash_password("a-strong-test-password")
    assert hashed != "a-strong-test-password"
    assert verify_password("a-strong-test-password", hashed)
    assert not verify_password("wrong-password", hashed)


def test_password_over_bcrypt_limit_is_rejected():
    with pytest.raises(ValueError):
        hash_password("x" * 73)


def test_access_token_contains_expiry_and_subject():
    token = create_access_token({"sub": "person@example.test", "role": "user"})
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == "person@example.test"
    assert payload["role"] == "user"
    assert payload["exp"] > payload["iat"]
