class RequestMessage:

  def __init__(self, action: str, data: any = None, request_id: str = None):
    self.action = action
    self.data = data
    self.request_id = request_id