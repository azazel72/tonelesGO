class RequestMessage:

  def __init__(self, action: str, data: any = None):
    self.action = action
    self.data = data
