# Key Decisions

## 2025-08-13

### Decision: Use previously uploaded HTML files for API documentation synthesis.

- **Rationale:** The provided GitHub repository for DSP_AI was empty, and direct OpenAPI JSON downloads from Amazon's website were unsuccessful (returned HTML content). The previously uploaded HTML files are the only available source of detailed API information.
- **Impact:** This requires manual extraction and synthesis of API details from HTML, which is more time-consuming than parsing OpenAPI specifications. However, it is the only viable path forward with the current resources.

### Decision: Utilize GitHub for iterative code pushes and project documentation.

- **Rationale:** User explicitly requested iterative code pushes to a GitHub repository and maintenance of `PROGRESS.md`, `TODO.md`, and `DECISIONS.md` files.
- **Impact:** Ensures transparency, version control, and clear communication of project status and decisions.



### Authentication Request Body Format
- **Decision:** Changed the `Content-Type` for the authentication (token) request from `application/x-www-form-urlencoded` to `application/json`, and the request body from `URLSearchParams` to `JSON.stringify`.
- **Rationale:** A working example provided by the user demonstrated that Amazon's authentication API expects a JSON payload for the token request, despite the Postman cURL command (which worked) using `application/x-www-form-urlencoded`. This change aligns our implementation with a known working pattern.
- **Impact:** Expected to resolve the `403 Forbidden` error on the authentication endpoint.


