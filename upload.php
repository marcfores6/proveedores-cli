<?php
$target_dir = "assets/";
$target_file = $target_dir . basename($_FILES["archivo"]["name"]);

if (move_uploaded_file($_FILES["archivo"]["tmp_name"], $target_file)) {
    echo json_encode([
        "success" => true,
        "url" => "https://proveedores.familycash.es/assets/" . basename($_FILES["archivo"]["name"])
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error subiendo el archivo."
    ]);
}
?>
