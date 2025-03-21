import onnxruntime as ort

print(ort.get_available_providers())
print(ort.get_device())  # 应该输出 'GPU'
