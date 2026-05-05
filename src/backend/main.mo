import List "mo:core/List";
import Types "types/tasks";
import TasksApi "mixins/tasks-api";

actor {
  let tasks = List.empty<Types.Task>();
  include TasksApi(tasks);
};

