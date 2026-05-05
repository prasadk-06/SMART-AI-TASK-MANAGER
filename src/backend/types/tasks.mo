import Time "mo:core/Time";

module {
  public type Priority = { #Low; #Medium; #High };

  public type Tag = { #Work; #Study; #Personal };

  public type Status = { #Pending; #Completed };

  public type Task = {
    id : Text;
    userId : Principal;
    title : Text;
    description : ?Text;
    dueDate : ?Int;
    priority : Priority;
    tags : [Tag];
    status : Status;
    order : Nat;
    createdAt : Int;
    updatedAt : Int;
  };

  public type CreateTaskInput = {
    title : Text;
    description : ?Text;
    dueDate : ?Int;
    priority : Priority;
    tags : [Tag];
  };

  public type UpdateTaskInput = {
    id : Text;
    title : Text;
    description : ?Text;
    dueDate : ?Int;
    priority : Priority;
    tags : [Tag];
  };

  public type TaskOrderEntry = {
    id : Text;
    order : Nat;
  };
};
