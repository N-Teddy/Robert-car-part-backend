import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 500 }, // 10 VUs for 30 seconds
    ],
};

// First, get an authentication token
function getAuthToken() {
    const loginRes = http.post('http://localhost:3000/api/auth/login', {
        email: "admin@company.com",
        password: "admin123"
    });

    return loginRes.json('accessToken');
}

export default function () {
    const token = getAuthToken();

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const res = http.get('http://localhost:3000/api', { headers });

    check(res, {
        'status is 200': (r) => r.status === 200,
        'has correct message': (r) => JSON.parse(r.body).message === 'Operation completed successfully',
        'has hello world data': (r) => JSON.parse(r.body).data === 'Hello World!',
    });
    sleep(1);
}